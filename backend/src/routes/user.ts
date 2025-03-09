import express, { Router } from 'express'
import { signup, login } from '../controller/user'
import { auth, checkAuth } from '../middleware/auth'

const router: Router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/check', auth, checkAuth);

export default router