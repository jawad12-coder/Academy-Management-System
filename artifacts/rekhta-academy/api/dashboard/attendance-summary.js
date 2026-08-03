import handler from '../[...path].js';

export default function attendanceSummary(req, res) {
  req.query = { ...req.query, path: ['dashboard', 'attendance-summary'] };
  return handler(req, res);
}
