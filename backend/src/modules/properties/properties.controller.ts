import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, PropertyStatus, PropertyType } from '@prisma/client';

@Controller('api/properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private service: PropertiesService) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: PropertyType,
    @Query('status') status?: PropertyStatus,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('bedrooms') bedrooms?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      type,
      status,
      state,
      city,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      bedrooms: bedrooms ? +bedrooms : undefined,
      featured: featured === 'true',
      search,
    });
  }

  @Public()
  @Get('featured')
  findFeatured() {
    return this.service.findFeatured();
  }

  @Public()
  @Get('states')
  getStates() {
    return this.service.getStates();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.service.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePropertyDto>) {
    return this.service.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: PropertyStatus) {
    return this.service.updateStatus(id, status);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/documents')
  addDocument(
    @Param('id') id: string,
    @Body() doc: { type: string; name: string; url: string },
  ) {
    return this.service.addDocument(id, doc);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('documents/:docId')
  deleteDocument(@Param('docId') docId: string) {
    return this.service.deleteDocument(docId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/inspection-slots')
  addInspectionSlot(
    @Param('id') id: string,
    @Body() slot: { date: string; time: string; maxVisitors?: number; fee?: number },
  ) {
    return this.service.addInspectionSlot(id, slot);
  }
}
