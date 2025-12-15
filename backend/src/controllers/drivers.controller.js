import * as service from '../services/drivers.service.js';

// List all drivers
export const listDrivers = async (req, res, next) => {
    try {
        const { status, busId, page, pageSize } = req.query;
        const result = await service.listDrivers({ status, busId, page, pageSize });
        res.json(result);
    } catch (e) { next(e); }
};

// Get driver by ID
export const getDriverById = async (req, res, next) => {
    try {
        const driver = await service.getDriverById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (e) { next(e); }
};

// Create driver
export const createDriver = async (req, res, next) => {
    try {
        const driver = await service.createDriver(req.body);
        res.status(201).json(driver);
    } catch (e) { next(e); }
};

// Update driver
export const updateDriver = async (req, res, next) => {
    try {
        const driver = await service.updateDriver(req.params.id, req.body);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (e) { next(e); }
};

// Delete driver - with financial records warning
export const deleteDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { force } = req.query;

        // Check if driver has financial records
        const hasRecords = await service.hasFinancialRecords(id);
        if (hasRecords && force !== 'true') {
            return res.status(409).json({
                message: 'This driver has financial records. Deleting may affect reports.',
                hasFinancialRecords: true,
                requiresConfirmation: true
            });
        }

        await service.deleteDriver(id);
        res.json({ success: true });
    } catch (e) { next(e); }
};

// Get driver payroll
export const getDriverPayroll = async (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        const items = await service.getDriverPayroll(req.params.id, { page, pageSize });
        res.json({ items });
    } catch (e) { next(e); }
};

// Create driver payroll
export const createDriverPayroll = async (req, res, next) => {
    try {
        const payroll = await service.createDriverPayroll({
            ...req.body,
            driverId: req.params.id,
            createdBy: req.user?.id
        });
        res.status(201).json(payroll);
    } catch (e) { next(e); }
};

// Update payroll status
export const updatePayrollStatus = async (req, res, next) => {
    try {
        const { status, transactionReference } = req.body;
        const result = await service.updateDriverPayrollStatus(req.params.payrollId, status, transactionReference);
        if (!result) return res.status(404).json({ message: 'Payroll not found' });
        res.json(result);
    } catch (e) { next(e); }
};

// Count drivers
export const countDrivers = async (req, res, next) => {
    try {
        const count = await service.countDrivers();
        res.json({ count });
    } catch (e) { next(e); }
};
