import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllSpotsQueryDto {
    @ApiPropertyOptional({ description: 'Dataset name' })
    dataset?: string;

    @ApiPropertyOptional({ description: 'Arrondissement code' })
    arrondissement?: string;

    @ApiPropertyOptional({ type: Boolean, description: 'Filter by free access' })
    isFree?: boolean;

    @ApiPropertyOptional({ type: Boolean, description: 'Filter by availability' })
    isAvailable?: boolean;

    @ApiPropertyOptional({ description: 'Text search on name' })
    q?: string;

    @ApiPropertyOptional({ type: Number, description: 'Maximum heat risk score' })
    maxHeatRisk?: number;

    @ApiPropertyOptional({ type: Number, default: 1 })
    page?: number;

    @ApiPropertyOptional({ type: Number, default: 20 })
    limit?: number;
}

export class FindNearbyQueryDto {
    @ApiProperty({ type: Number })
    lat!: number;

    @ApiProperty({ type: Number })
    lng!: number;

    @ApiPropertyOptional({ type: Number, default: 1 })
    radius?: number;

    @ApiPropertyOptional({ description: 'Dataset name (fountain, green_space, equipment)' })
    dataset?: string;

    @ApiPropertyOptional({ description: 'Arrondissement code (e.g. 75011)' })
    arrondissement?: string;

    @ApiPropertyOptional({ type: Boolean, description: 'Filter by free access' })
    isFree?: boolean;

    @ApiPropertyOptional({ type: Number, description: 'Maximum heat risk score' })
    maxHeatRisk?: number;

    @ApiPropertyOptional({ description: 'Text search on name' })
    q?: string;
}

export class CoolSpotDto {
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional()
    sourceId?: string | null;

    @ApiProperty()
    dataset!: string;

    @ApiProperty()
    nom!: string;

    @ApiPropertyOptional()
    type?: string | null;

    @ApiProperty()
    lat!: number;

    @ApiProperty()
    lng!: number;

    @ApiPropertyOptional()
    adresse?: string | null;

    @ApiPropertyOptional()
    arrondissement?: string | null;

    @ApiPropertyOptional({ type: Boolean })
    isFree?: boolean | null;

    @ApiPropertyOptional({ type: Boolean })
    isAvailable?: boolean | null;

    @ApiPropertyOptional({ type: Boolean })
    caniculeOuverture?: boolean | null;

    @ApiPropertyOptional({ type: Boolean })
    ouvertureEstivaleNocturne?: boolean | null;

    @ApiPropertyOptional()
    categorie?: string | null;

    @ApiPropertyOptional()
    modele?: string | null;

    @ApiPropertyOptional({ type: Number })
    surfVegetSup8m2024?: number | null;

    @ApiPropertyOptional({ type: Number })
    indiceVegetSup8m2024?: number | null;

    @ApiProperty({ type: Number })
    heatRiskScore!: number;
}

export class SpotsPageDto {
    @ApiProperty({ type: [CoolSpotDto] })
    data!: CoolSpotDto[];

    @ApiProperty({ type: Number })
    total!: number;

    @ApiProperty({ type: Number })
    page!: number;

    @ApiProperty({ type: Number })
    totalPages!: number;
}
