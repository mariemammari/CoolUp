import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
    CoolSpotDto,
    FindAllSpotsQueryDto,
    FindNearbyQueryDto,
    SpotsPageDto,
} from './spots.dto';
import { SpotsService } from './spots.service';

@ApiTags('spots')
@Controller('spots')
export class SpotsController {
    constructor(private readonly spotsService: SpotsService) { }

    @Get()
    @ApiOperation({ summary: 'List cool spots with filters' })
    @ApiQuery({ name: 'dataset', required: false })
    @ApiQuery({ name: 'arrondissement', required: false })
    @ApiQuery({ name: 'isFree', required: false, type: Boolean })
    @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
    @ApiQuery({ name: 'q', required: false })
    @ApiQuery({ name: 'maxHeatRisk', required: false, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, type: SpotsPageDto })
    async findAll(@Query() query: FindAllSpotsQueryDto): Promise<SpotsPageDto> {
        const page = this.parseNumber(query.page, 1);
        const limit = this.parseNumber(query.limit, 20);

        return this.spotsService.findAll({
            dataset: query.dataset,
            arrondissement: query.arrondissement,
            isFree: this.parseBoolean(query.isFree),
            isAvailable: this.parseBoolean(query.isAvailable),
            q: query.q,
            maxHeatRisk: this.parseNumber(query.maxHeatRisk),
            page,
            limit,
        });
    }

    @Get('nearby')
    @ApiOperation({ summary: 'Find cool spots near a location' })
    @ApiQuery({ name: 'lat', required: true, type: Number })
    @ApiQuery({ name: 'lng', required: true, type: Number })
    @ApiQuery({ name: 'radius', required: false, type: Number })
    @ApiQuery({ name: 'dataset', required: false })
    @ApiQuery({ name: 'arrondissement', required: false })
    @ApiQuery({ name: 'isFree', required: false, type: Boolean })
    @ApiQuery({ name: 'maxHeatRisk', required: false, type: Number })
    @ApiQuery({ name: 'q', required: false })
    @ApiResponse({ status: 200, type: [CoolSpotDto] })
    async findNearby(
        @Query() query: FindNearbyQueryDto,
    ): Promise<CoolSpotDto[]> {
        const lat = this.parseNumber(query.lat);
        const lng = this.parseNumber(query.lng);
        const radius = this.parseNumber(query.radius, 1);

        if (lat === undefined || lng === undefined) {
            throw new BadRequestException('lat and lng are required.');
        }

        return this.spotsService.findNearby(lat, lng, radius, {
            dataset: query.dataset,
            arrondissement: query.arrondissement,
            isFree: this.parseBoolean(query.isFree),
            maxHeatRisk: this.parseNumber(query.maxHeatRisk),
            q: query.q,
        });
    }

    private parseBoolean(value?: boolean | string): boolean | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value === 'boolean') {
            return value;
        }

        const normalized = value.toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }

        throw new BadRequestException('Invalid boolean query parameter.');
    }

    private parseNumber(value?: number | string, fallback?: number): number | undefined {
        if (value === undefined) {
            return fallback;
        }

        const parsed = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(parsed)) {
            throw new BadRequestException('Invalid numeric query parameter.');
        }

        return parsed;
    }
}
