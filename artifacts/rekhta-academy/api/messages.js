import handler from './[...path].js';

export default function messages(req, res) {
  req.query = { ...req.query, path: ['messages'] };
  return handler(req, res);
}
