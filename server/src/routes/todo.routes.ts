import { Router } from 'express';
import { getTodos, getTodo, createTodo, updateTodo, deleteTodo, completeTodo, toggleSubtask } from '../controllers/todo.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getTodos);
router.get('/:id', getTodo);
router.post('/', createTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);
router.patch('/:id/complete', completeTodo);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);

export default router;
