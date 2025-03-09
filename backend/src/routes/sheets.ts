import express, { Router } from 'express'
import { metaData, sheetData } from '../controller/sheets'
import { auth } from '../middleware/auth'

const router: Router = express.Router()

router.post('/metadata', auth, metaData)
router.post('/sheetdata', auth, sheetData)

export default router