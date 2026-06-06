import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, type CoolSpot } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

interface PipelineRecord {
    source_id: string | null;
    dataset: string;
    nom: string | null;
    type: string | null;
    lat: number | string;
    lng: number | string;
    adresse: string | null;
    arrondissement: string | null;
    is_free: boolean | null;
    is_available: boolean | null;
    canicule_ouverture: boolean | null;
    ouverture_estivale_nocturne: boolean | null;
    categorie: string | null;
    modele: string | null;
    surf_veget_sup8m_2024: number | null;
    indice_veget_sup8m_2024: number | null;
    heat_risk_score: number | string;
}

interface PipelineResponse {
    total: number;
    records: PipelineRecord[];
}

export interface FindAllFilters {
    dataset?: string;
    arrondissement?: string;
    isFree?: boolean;
    isAvailable?: boolean;
    q?: string;
    maxHeatRisk?: number;
    page?: number;
    limit?: number;
}

const spotSelect = {
    id: true,
    sourceId: true,
    dataset: true,
    nom: true,
    type: true,
    lat: true,
    lng: true,
    adresse: true,
    arrondissement: true,
    isFree: true,
    isAvailable: true,
    caniculeOuverture: true,
    ouvertureEstivaleNocturne: true,
    categorie: true,
    modele: true,
    surfVegetSup8m2024: true,
    indiceVegetSup8m2024: true,
    heatRiskScore: true,
} as const;

type SpotRow = Pick<CoolSpot, keyof typeof spotSelect>;

@Injectable()
export class SpotsService implements OnModuleInit {
    private readonly logger = new Logger(SpotsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    onModuleInit(): void {
        void this.syncSpots();
    }

    @Cron(CronExpression.EVERY_6_HOURS)
    async syncSpots(): Promise<void> {
        const baseUrl = this.configService.get<string>('DATA_PIPELINE_URL');
        if (!baseUrl) {
            this.logger.warn('DATA_PIPELINE_URL is not set; skipping sync.');
            return;
        }

        const url = `${baseUrl.replace(/\/$/, '')}/process`;
        this.logger.log(`Syncing cool spots from ${url}`);

        try {
            const response = await firstValueFrom(
                this.httpService.get<PipelineResponse>(url),
            );
            const records = response.data?.records ?? [];

            if (!Array.isArray(records) || records.length === 0) {
                this.logger.warn('No records returned by the data pipeline.');
                return;
            }

            const batches = this.chunk(records, 200);
            let processed = 0;
            let skipped = 0;

            for (const batch of batches) {
                const upserts = batch.map((record) => {
                    const mapped = this.mapRecord(record);
                    if (!mapped) {
                        skipped += 1;
                        return Promise.resolve(null);
                    }

                    return this.prisma.coolSpot.upsert({
                        where: {
                            sourceId_dataset: {
                                sourceId: mapped.sourceId!,
                                dataset: mapped.dataset,
                            },
                        },
                        create: mapped,
                        update: mapped,
                        select: { id: true },
                    });
                });

                await Promise.all(upserts);
                processed += batch.length;
                this.logger.log(`Synced ${processed} / ${records.length} records`);
            }

            if (skipped > 0) {
                this.logger.warn(`Skipped ${skipped} invalid records.`);
            }

            this.logger.log('Spot sync completed.');
        } catch (error) {
            this.logger.error(
                'Failed to sync spots from the data pipeline.',
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    async findAll(filters: FindAllFilters): Promise<{
        data: SpotRow[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const page = Math.max(filters.page ?? 1, 1);
        const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);

        const where: Prisma.CoolSpotWhereInput = {};
        if (filters.dataset) {
            where.dataset = filters.dataset;
        }
        if (filters.arrondissement) {
            where.arrondissement = filters.arrondissement;
        }
        if (filters.isFree !== undefined) {
            where.isFree = filters.isFree;
        }
        if (filters.isAvailable !== undefined) {
            where.isAvailable = filters.isAvailable;
        }
        if (filters.q) {
            where.nom = { contains: filters.q, mode: 'insensitive' };
        }
        if (filters.maxHeatRisk !== undefined) {
            where.heatRiskScore = { lte: filters.maxHeatRisk };
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.coolSpot.findMany({
                where,
                select: spotSelect,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { heatRiskScore: 'asc' },
            }),
            this.prisma.coolSpot.count({ where }),
        ]);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            totalPages,
        };
    }

    async findNearby(lat: number, lng: number, radiusKm = 1, filters: Partial<FindAllFilters> = {}): Promise<SpotRow[]> {
        const radiusMeters = Math.max(radiusKm, 0.1) * 1000;
        const maxResults = 500;
        const earthRadiusMeters = 6371000;

        // Haversine distance in meters
        const distanceExpr = Prisma.sql`
      (${earthRadiusMeters} * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(${lat})) * cos(radians("lat")) * cos(radians("lng") - radians(${lng}))
          + sin(radians(${lat})) * sin(radians("lat"))
        ))
      ))
    `;

        const conditions: Prisma.Sql[] = [
            Prisma.sql`${distanceExpr} <= ${radiusMeters}`
        ];

        if (filters.dataset) {
            conditions.push(Prisma.sql`"dataset" = ${filters.dataset}`);
        }
        if (filters.arrondissement) {
            conditions.push(Prisma.sql`"arrondissement" = ${filters.arrondissement}`);
        }
        if (filters.isFree !== undefined) {
            conditions.push(Prisma.sql`"isFree" = ${filters.isFree}`);
        }
        if (filters.isAvailable !== undefined) {
            conditions.push(Prisma.sql`"isAvailable" = ${filters.isAvailable}`);
        }
        if (filters.q) {
            conditions.push(Prisma.sql`"nom" ILIKE ${'%' + filters.q + '%'}`);
        }
        if (filters.maxHeatRisk !== undefined) {
            conditions.push(Prisma.sql`"heatRiskScore" <= ${filters.maxHeatRisk}`);
        }

        const whereClause = Prisma.join(conditions, ' AND ');

        return this.prisma.$queryRaw<SpotRow[]>`
      SELECT
        "id",
        "sourceId",
        "dataset",
        "nom",
        "type",
        "lat",
        "lng",
        "adresse",
        "arrondissement",
        "isFree",
        "isAvailable",
        "caniculeOuverture",
        "ouvertureEstivaleNocturne",
        "categorie",
        "modele",
        "surfVegetSup8m2024",
        "indiceVegetSup8m2024",
        "heatRiskScore"
      FROM "CoolSpot"
      WHERE ${whereClause}
      ORDER BY ${distanceExpr}
      LIMIT ${maxResults};
    `;
    }

    private mapRecord(record: PipelineRecord): Prisma.CoolSpotCreateInput | null {
        if (!record.source_id || !record.dataset || !record.nom) {
            return null;
        }

        const lat = Number(record.lat);
        const lng = Number(record.lng);
        const heatRiskScore = Number(record.heat_risk_score);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            !Number.isFinite(heatRiskScore)
        ) {
            return null;
        }

        return {
            sourceId: record.source_id,
            dataset: record.dataset,
            nom: record.nom,
            type: record.type ?? null,
            lat,
            lng,
            adresse: record.adresse ?? null,
            arrondissement: record.arrondissement ?? null,
            isFree: record.is_free ?? null,
            isAvailable: record.is_available ?? null,
            caniculeOuverture: record.canicule_ouverture ?? null,
            ouvertureEstivaleNocturne: record.ouverture_estivale_nocturne ?? null,
            categorie: record.categorie ?? null,
            modele: record.modele ?? null,
            surfVegetSup8m2024: record.surf_veget_sup8m_2024 ?? null,
            indiceVegetSup8m2024: record.indice_veget_sup8m_2024 ?? null,
            heatRiskScore,
        };
    }

    private chunk<T>(items: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let index = 0; index < items.length; index += size) {
            chunks.push(items.slice(index, index + size));
        }
        return chunks;
    }
}
