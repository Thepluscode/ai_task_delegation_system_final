"""
Advanced Manufacturing Automation Platform
Production line control, quality management, and lean manufacturing optimization
"""

import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import numpy as np
from sqlalchemy import create_engine, MetaData, Table, Column, String, DateTime, Float, Integer, JSON, Boolean

logger = logging.getLogger(__name__)

class ProductionStatus(Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    QUALITY_HOLD = "quality_hold"

class QualityStatus(Enum):
    PASS = "pass"
    FAIL = "fail"
    REWORK = "rework"
    PENDING = "pending"
    QUARANTINE = "quarantine"

class EquipmentStatus(Enum):
    RUNNING = "running"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    BREAKDOWN = "breakdown"
    SETUP = "setup"

class MaintenanceType(Enum):
    PREVENTIVE = "preventive"
    PREDICTIVE = "predictive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"

@dataclass
class ProductionOrder:
    order_id: str
    part_number: str
    quantity: int
    priority: int
    planned_start: datetime
    planned_end: datetime
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    status: ProductionStatus
    assigned_line: str
    quality_requirements: Dict[str, Any]
    materials_required: List[Dict[str, Any]]
    routing: List[str]  # Sequence of operations
    
@dataclass
class QualityInspection:
    inspection_id: str
    order_id: str
    part_number: str
    inspection_type: str
    measurements: Dict[str, float]
    specifications: Dict[str, Dict[str, float]]  # min/max values
    status: QualityStatus
    inspector: str  # human or robot ID
    timestamp: datetime
    defects_found: List[str]
    corrective_actions: List[str]

@dataclass
class Equipment:
    equipment_id: str
    name: str
    type: str
    location: str
    status: EquipmentStatus
    current_job: Optional[str]
    utilization_rate: float
    oee_score: float  # Overall Equipment Effectiveness
    last_maintenance: datetime
    next_maintenance: datetime
    performance_metrics: Dict[str, float]

class ProductionLineController:
    """Real-time production line control and monitoring"""
    
    def __init__(self):
        self.production_lines = {}
        self.active_orders = {}
        self.equipment_status = {}
        self.production_metrics = {}
    
    async def start_production_order(self, order: ProductionOrder) -> bool:
        """Start production order on assigned line"""
        try:
            # Validate prerequisites
            if not await self._validate_order_prerequisites(order):
                logger.error(f"Prerequisites not met for order {order.order_id}")
                return False
            
            # Reserve equipment and resources
            await self._reserve_resources(order)
            
            # Update order status
            order.status = ProductionStatus.IN_PROGRESS
            order.actual_start = datetime.now(timezone.utc)
            self.active_orders[order.order_id] = order
            
            # Start monitoring
            await self._start_production_monitoring(order)
            
            logger.info(f"Started production order {order.order_id} on line {order.assigned_line}")
            return True
            
        except Exception as e:
            logger.error(f"Error starting production order {order.order_id}: {e}")
            return False
    
    async def _validate_order_prerequisites(self, order: ProductionOrder) -> bool:
        """Validate all prerequisites for production order"""
        # Check material availability
        for material in order.materials_required:
            available_qty = await self._check_material_inventory(material['part_number'])
            if available_qty < material['quantity']:
                logger.warning(f"Insufficient material: {material['part_number']}")
                return False
        
        # Check equipment availability
        line_equipment = await self._get_line_equipment(order.assigned_line)
        for equipment_id in line_equipment:
            equipment = self.equipment_status.get(equipment_id)
            if not equipment or equipment.status not in [EquipmentStatus.IDLE, EquipmentStatus.RUNNING]:
                logger.warning(f"Equipment not available: {equipment_id}")
                return False
        
        # Check quality specifications
        if not order.quality_requirements:
            logger.warning(f"No quality requirements defined for order {order.order_id}")
            return False
        
        return True
    
    async def _check_material_inventory(self, part_number: str) -> int:
        """Check material inventory levels"""
        # Interface with inventory management system
        # Simplified simulation
        return np.random.randint(100, 1000)
    
    async def _get_line_equipment(self, line_id: str) -> List[str]:
        """Get equipment assigned to production line"""
        # Return list of equipment IDs for the line
        return [f"{line_id}_robot_1", f"{line_id}_cnc_1", f"{line_id}_qc_station"]
    
    async def _reserve_resources(self, order: ProductionOrder):
        """Reserve equipment and materials for production order"""
        # Reserve materials
        for material in order.materials_required:
            await self._reserve_material(material['part_number'], material['quantity'])
        
        # Reserve equipment
        line_equipment = await self._get_line_equipment(order.assigned_line)
        for equipment_id in line_equipment:
            if equipment_id in self.equipment_status:
                self.equipment_status[equipment_id].current_job = order.order_id
    
    async def _reserve_material(self, part_number: str, quantity: int):
        """Reserve material from inventory"""
        logger.info(f"Reserved {quantity} units of {part_number}")
    
    async def _start_production_monitoring(self, order: ProductionOrder):
        """Start real-time monitoring of production order"""
        # Monitor production progress
        # Track quality metrics
        # Monitor equipment performance
        # Alert on deviations
        
        asyncio.create_task(self._monitor_production_progress(order))
    
    async def _monitor_production_progress(self, order: ProductionOrder):
        """Monitor production progress in real-time"""
        while order.status == ProductionStatus.IN_PROGRESS:
            try:
                # Check production status
                progress = await self._get_production_progress(order.order_id)
                
                # Update metrics
                self.production_metrics[order.order_id] = {
                    'progress_percentage': progress,
                    'units_completed': int(order.quantity * progress / 100),
                    'estimated_completion': self._estimate_completion_time(order, progress),
                    'quality_status': await self._get_current_quality_status(order.order_id)
                }
                
                # Check for issues
                await self._check_production_issues(order)
                
                # Sleep before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error monitoring production order {order.order_id}: {e}")
                break
    
    async def _get_production_progress(self, order_id: str) -> float:
        """Get current production progress percentage"""
        # Interface with MES system or equipment controllers
        # Simplified simulation
        return min(100.0, np.random.uniform(0, 100))
    
    def _estimate_completion_time(self, order: ProductionOrder, progress: float) -> datetime:
        """Estimate completion time based on current progress"""
        if progress <= 0:
            return order.planned_end
        
        elapsed_time = datetime.now(timezone.utc) - order.actual_start
        total_estimated_time = elapsed_time * (100 / progress)
        return order.actual_start + total_estimated_time
    
    async def _get_current_quality_status(self, order_id: str) -> str:
        """Get current quality status for production order"""
        # Check latest quality inspections
        # Return overall quality status
        return "on_track"  # Simplified
    
    async def _check_production_issues(self, order: ProductionOrder):
        """Check for production issues and alerts"""
        # Check for delays
        expected_progress = self._calculate_expected_progress(order)
        actual_progress = await self._get_production_progress(order.order_id)
        
        if actual_progress < expected_progress - 10:  # 10% tolerance
            await self._handle_production_delay(order, expected_progress, actual_progress)
        
        # Check equipment status
        line_equipment = await self._get_line_equipment(order.assigned_line)
        for equipment_id in line_equipment:
            equipment = self.equipment_status.get(equipment_id)
            if equipment and equipment.status == EquipmentStatus.BREAKDOWN:
                await self._handle_equipment_breakdown(order, equipment_id)
    
    def _calculate_expected_progress(self, order: ProductionOrder) -> float:
        """Calculate expected progress based on planned timeline"""
        total_duration = (order.planned_end - order.planned_start).total_seconds()
        elapsed_duration = (datetime.now(timezone.utc) - order.actual_start).total_seconds()
        return min(100.0, (elapsed_duration / total_duration) * 100)
    
    async def _handle_production_delay(self, order: ProductionOrder, expected: float, actual: float):
        """Handle production delay"""
        delay_alert = {
            'order_id': order.order_id,
            'alert_type': 'production_delay',
            'expected_progress': expected,
            'actual_progress': actual,
            'delay_percentage': expected - actual,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        logger.warning(f"Production delay detected for order {order.order_id}: {delay_alert}")
    
    async def _handle_equipment_breakdown(self, order: ProductionOrder, equipment_id: str):
        """Handle equipment breakdown"""
        breakdown_alert = {
            'order_id': order.order_id,
            'equipment_id': equipment_id,
            'alert_type': 'equipment_breakdown',
            'impact': 'production_stopped',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Pause production order
        order.status = ProductionStatus.PAUSED
        
        logger.critical(f"Equipment breakdown - Production paused for order {order.order_id}")

class QualityControlSystem:
    """Automated quality control and inspection"""
    
    def __init__(self):
        self.inspection_stations = {}
        self.quality_standards = {}
        self.defect_patterns = {}
    
    async def perform_quality_inspection(self, order_id: str, part_number: str, 
                                       inspection_type: str, inspector_id: str) -> QualityInspection:
        """Perform automated quality inspection"""
        inspection_id = str(uuid.uuid4())
        
        # Get quality specifications
        specifications = self.quality_standards.get(part_number, {})
        
        # Perform measurements (simulated)
        measurements = await self._perform_measurements(part_number, inspection_type)
        
        # Evaluate against specifications
        status, defects = await self._evaluate_quality(measurements, specifications)
        
        # Generate corrective actions if needed
        corrective_actions = []
        if status != QualityStatus.PASS:
            corrective_actions = await self._generate_corrective_actions(defects, part_number)
        
        inspection = QualityInspection(
            inspection_id=inspection_id,
            order_id=order_id,
            part_number=part_number,
            inspection_type=inspection_type,
            measurements=measurements,
            specifications=specifications,
            status=status,
            inspector=inspector_id,
            timestamp=datetime.now(timezone.utc),
            defects_found=defects,
            corrective_actions=corrective_actions
        )
        
        # Log inspection results
        await self._log_inspection_results(inspection)
        
        logger.info(f"Quality inspection completed: {inspection_id} - Status: {status.value}")
        return inspection
    
    async def _perform_measurements(self, part_number: str, inspection_type: str) -> Dict[str, float]:
        """Perform physical measurements using automated systems"""
        # Simulate measurements from various inspection equipment
        measurements = {}
        
        if inspection_type == "dimensional":
            measurements.update({
                'length': np.random.normal(100.0, 0.1),
                'width': np.random.normal(50.0, 0.05),
                'height': np.random.normal(25.0, 0.02),
                'diameter': np.random.normal(10.0, 0.01)
            })
        
        elif inspection_type == "surface":
            measurements.update({
                'roughness': np.random.normal(1.6, 0.2),
                'flatness': np.random.normal(0.01, 0.002),
                'roundness': np.random.normal(0.005, 0.001)
            })
        
        elif inspection_type == "functional":
            measurements.update({
                'torque': np.random.normal(50.0, 2.0),
                'pressure_test': np.random.normal(100.0, 5.0),
                'electrical_resistance': np.random.normal(10.0, 0.5)
            })
        
        return measurements
    
    async def _evaluate_quality(self, measurements: Dict[str, float], 
                              specifications: Dict[str, Dict[str, float]]) -> Tuple[QualityStatus, List[str]]:
        """Evaluate measurements against quality specifications"""
        defects = []
        
        for measurement_name, value in measurements.items():
            if measurement_name in specifications:
                spec = specifications[measurement_name]
                min_val = spec.get('min', float('-inf'))
                max_val = spec.get('max', float('inf'))
                
                if value < min_val:
                    defects.append(f"{measurement_name} below minimum: {value} < {min_val}")
                elif value > max_val:
                    defects.append(f"{measurement_name} above maximum: {value} > {max_val}")
        
        # Determine overall status
        if not defects:
            return QualityStatus.PASS, defects
        elif len(defects) <= 2:  # Minor defects
            return QualityStatus.REWORK, defects
        else:  # Major defects
            return QualityStatus.FAIL, defects
    
    async def _generate_corrective_actions(self, defects: List[str], part_number: str) -> List[str]:
        """Generate corrective actions for quality issues"""
        actions = []
        
        for defect in defects:
            if "below minimum" in defect:
                actions.append("Adjust machining parameters to increase dimension")
            elif "above maximum" in defect:
                actions.append("Adjust machining parameters to decrease dimension")
            elif "roughness" in defect:
                actions.append("Check cutting tool condition and replace if necessary")
            elif "torque" in defect:
                actions.append("Verify assembly torque specifications and retighten")
        
        return actions
    
    async def _log_inspection_results(self, inspection: QualityInspection):
        """Log inspection results for traceability"""
        # Store in quality database
        # Update statistical process control charts
        # Trigger alerts if needed
        
        logger.info(f"Logged quality inspection: {inspection.inspection_id}")

class OEEMonitor:
    """Overall Equipment Effectiveness monitoring"""
    
    def __init__(self):
        self.equipment_data = {}
        self.oee_targets = {}
    
    async def calculate_oee(self, equipment_id: str, time_period: timedelta) -> Dict[str, float]:
        """Calculate OEE for equipment over time period"""
        end_time = datetime.now(timezone.utc)
        start_time = end_time - time_period
        
        # Get equipment data for time period
        data = await self._get_equipment_data(equipment_id, start_time, end_time)
        
        # Calculate availability
        availability = self._calculate_availability(data, time_period)
        
        # Calculate performance
        performance = self._calculate_performance(data)
        
        # Calculate quality
        quality = self._calculate_quality(data)
        
        # Calculate overall OEE
        oee = availability * performance * quality
        
        oee_metrics = {
            'availability': availability,
            'performance': performance,
            'quality': quality,
            'oee': oee,
            'time_period_hours': time_period.total_seconds() / 3600
        }
        
        logger.info(f"OEE calculated for {equipment_id}: {oee:.2%}")
        return oee_metrics
    
    async def _get_equipment_data(self, equipment_id: str, start_time: datetime, 
                                end_time: datetime) -> Dict[str, Any]:
        """Get equipment operational data for time period"""
        # Simulate equipment data
        return {
            'planned_production_time': 8 * 3600,  # 8 hours in seconds
            'downtime': np.random.randint(0, 3600),  # Random downtime
            'ideal_cycle_time': 60,  # 60 seconds per unit
            'actual_cycle_time': np.random.uniform(60, 75),  # Actual cycle time
            'total_units_produced': np.random.randint(400, 480),
            'good_units_produced': np.random.randint(380, 470)
        }
    
    def _calculate_availability(self, data: Dict[str, Any], time_period: timedelta) -> float:
        """Calculate equipment availability"""
        planned_time = data['planned_production_time']
        downtime = data['downtime']
        operating_time = planned_time - downtime
        
        return operating_time / planned_time if planned_time > 0 else 0.0
    
    def _calculate_performance(self, data: Dict[str, Any]) -> float:
        """Calculate equipment performance"""
        ideal_cycle_time = data['ideal_cycle_time']
        actual_cycle_time = data['actual_cycle_time']
        
        return ideal_cycle_time / actual_cycle_time if actual_cycle_time > 0 else 0.0
    
    def _calculate_quality(self, data: Dict[str, Any]) -> float:
        """Calculate quality rate"""
        total_units = data['total_units_produced']
        good_units = data['good_units_produced']
        
        return good_units / total_units if total_units > 0 else 0.0

class LeanManufacturingOptimizer:
    """Lean manufacturing and Six Sigma optimization"""
    
    def __init__(self):
        self.waste_categories = [
            'overproduction', 'waiting', 'transportation', 'overprocessing',
            'inventory', 'motion', 'defects', 'underutilized_talent'
        ]
        self.improvement_projects = {}
    
    async def identify_waste_opportunities(self, production_line: str) -> Dict[str, Any]:
        """Identify waste reduction opportunities"""
        waste_analysis = {}
        
        for waste_type in self.waste_categories:
            impact_score = await self._analyze_waste_impact(production_line, waste_type)
            waste_analysis[waste_type] = {
                'impact_score': impact_score,
                'improvement_potential': self._calculate_improvement_potential(impact_score),
                'recommended_actions': await self._get_waste_reduction_actions(waste_type)
            }
        
        # Prioritize opportunities
        prioritized_opportunities = sorted(
            waste_analysis.items(),
            key=lambda x: x[1]['impact_score'],
            reverse=True
        )
        
        return {
            'production_line': production_line,
            'waste_analysis': dict(prioritized_opportunities),
            'total_improvement_potential': sum(w['improvement_potential'] for w in waste_analysis.values()),
            'top_priority': prioritized_opportunities[0][0] if prioritized_opportunities else None
        }
    
    async def _analyze_waste_impact(self, production_line: str, waste_type: str) -> float:
        """Analyze impact of specific waste type"""
        # Simulate waste impact analysis
        return np.random.uniform(0.1, 1.0)
    
    def _calculate_improvement_potential(self, impact_score: float) -> float:
        """Calculate improvement potential based on impact score"""
        return impact_score * 0.3  # Assume 30% improvement potential
    
    async def _get_waste_reduction_actions(self, waste_type: str) -> List[str]:
        """Get recommended actions for waste reduction"""
        action_map = {
            'overproduction': [
                'Implement pull-based production system',
                'Reduce batch sizes',
                'Improve demand forecasting'
            ],
            'waiting': [
                'Balance production line',
                'Implement single-minute exchange of dies (SMED)',
                'Improve material flow'
            ],
            'transportation': [
                'Optimize facility layout',
                'Implement automated material handling',
                'Reduce material movement distances'
            ],
            'defects': [
                'Implement poka-yoke (error-proofing)',
                'Improve quality control processes',
                'Enhance operator training'
            ]
        }
        
        return action_map.get(waste_type, ['Analyze root causes', 'Implement countermeasures'])

class ManufacturingAutomationPlatform:
    """Main manufacturing automation platform orchestrator"""
    
    def __init__(self):
        self.production_controller = ProductionLineController()
        self.quality_system = QualityControlSystem()
        self.oee_monitor = OEEMonitor()
        self.lean_optimizer = LeanManufacturingOptimizer()
        self.equipment_registry = {}
    
    async def optimize_production_schedule(self, orders: List[ProductionOrder]) -> Dict[str, Any]:
        """Optimize production schedule for multiple orders"""
        optimization_result = {
            'optimized_schedule': [],
            'total_makespan': 0,
            'resource_utilization': {},
            'quality_risk_assessment': {},
            'improvement_recommendations': []
        }
        
        # Sort orders by priority and due date
        sorted_orders = sorted(orders, key=lambda x: (x.priority, x.planned_end))
        
        # Assign orders to production lines
        for order in sorted_orders:
            optimal_line = await self._find_optimal_production_line(order)
            if optimal_line:
                order.assigned_line = optimal_line
                optimization_result['optimized_schedule'].append({
                    'order_id': order.order_id,
                    'assigned_line': optimal_line,
                    'scheduled_start': order.planned_start.isoformat(),
                    'scheduled_end': order.planned_end.isoformat()
                })
        
        # Calculate metrics
        optimization_result['total_makespan'] = self._calculate_makespan(sorted_orders)
        optimization_result['resource_utilization'] = await self._calculate_resource_utilization(sorted_orders)
        
        # Identify improvement opportunities
        for line in set(order.assigned_line for order in sorted_orders if order.assigned_line):
            waste_opportunities = await self.lean_optimizer.identify_waste_opportunities(line)
            optimization_result['improvement_recommendations'].extend(
                waste_opportunities['waste_analysis']
            )
        
        return optimization_result
    
    async def _find_optimal_production_line(self, order: ProductionOrder) -> Optional[str]:
        """Find optimal production line for order"""
        # Consider line capabilities, current load, setup time
        available_lines = ['line_1', 'line_2', 'line_3']
        
        for line in available_lines:
            if await self._can_line_handle_order(line, order):
                return line
        
        return None
    
    async def _can_line_handle_order(self, line_id: str, order: ProductionOrder) -> bool:
        """Check if production line can handle the order"""
        # Check line capabilities
        # Check current capacity
        # Check material availability
        return True  # Simplified
    
    def _calculate_makespan(self, orders: List[ProductionOrder]) -> float:
        """Calculate total makespan for production schedule"""
        if not orders:
            return 0.0
        
        latest_end = max(order.planned_end for order in orders)
        earliest_start = min(order.planned_start for order in orders)
        
        return (latest_end - earliest_start).total_seconds() / 3600  # Hours
    
    async def _calculate_resource_utilization(self, orders: List[ProductionOrder]) -> Dict[str, float]:
        """Calculate resource utilization for production schedule"""
        utilization = {}
        
        # Group orders by assigned line
        line_orders = {}
        for order in orders:
            if order.assigned_line:
                if order.assigned_line not in line_orders:
                    line_orders[order.assigned_line] = []
                line_orders[order.assigned_line].append(order)
        
        # Calculate utilization for each line
        for line_id, line_order_list in line_orders.items():
            total_production_time = sum(
                (order.planned_end - order.planned_start).total_seconds()
                for order in line_order_list
            )
            
            # Assume 24 hours available time
            available_time = 24 * 3600  # seconds
            utilization[line_id] = min(1.0, total_production_time / available_time)
        
        return utilization

# Global manufacturing platform instance
manufacturing_platform = ManufacturingAutomationPlatform()
