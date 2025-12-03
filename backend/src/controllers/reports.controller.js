import * as service from '../services/reports.service.js';

export const overview = async (req, res, next) => {
  try {
    const data = await service.getOverview();
    res.json(data);
  } catch (e) { next(e); }
};

export const attendanceSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await service.getAttendanceSummary({ fromDate, toDate });
    res.json(data);
  } catch (e) { next(e); }
};

export const financeSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await service.getFinanceSummary({ fromDate, toDate });
    res.json(data);
  } catch (e) { next(e); }
};

export const examPerformance = async (req, res, next) => {
  try {
    const { examId } = req.query;
    const data = await service.getExamPerformance({ examId });
    res.json({ items: data });
  } catch (e) { next(e); }
};

export const attendanceByClass = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const rows = await service.getAttendanceByClass({ fromDate, toDate });
    res.json({ items: rows });
  } catch (e) { next(e); }
};

export const attendanceHeatmap = async (req, res, next) => {
  try {
    const { fromDate, toDate, class: klass, section, location } = req.query;
    const data = await service.getAttendanceHeatmap({ fromDate, toDate, klass, section, location });
    res.json(data);
  } catch (e) { next(e); }
};
