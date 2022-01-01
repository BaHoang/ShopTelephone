import express from "express";
import { orderProduct, getOrderById, getMyOrder, getOrder, updateOrder, destroyOrder } from '../controllers/orderController.js'
import { checkLogin, checkAdmin } from '../middleware/autheMiddleware.js'
const router = express.Router()

router.post('/', checkLogin, orderProduct)
router.get('/myorders', checkLogin, getMyOrder)
router.get('/:id', checkLogin, getOrderById)
router.get('/', checkLogin, checkAdmin, getOrder)
// cập nhật vào danh sách api truyền từ req.body orderStatus
router.put('/:id/status', checkLogin, checkAdmin, updateOrder)
router.put('/:id/destroy', checkLogin, destroyOrder)

export default router