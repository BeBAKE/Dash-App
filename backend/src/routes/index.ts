import express, { Router } from "express";
import userRouter from './user'
import sheetRouter from "./sheets"

const router: Router = express.Router()

router.use('/user', userRouter)
router.use('/sheets', sheetRouter)

export default router


