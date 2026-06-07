import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { adminController } from '../controllers/adminController';

const router = Router();
router.use(authenticate, requireAdmin);

// Users
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Buildings
router.get('/buildings', adminController.listBuildings);
router.post('/buildings', adminController.createBuilding);
router.patch('/buildings/:id', adminController.updateBuilding);
router.delete('/buildings/:id', adminController.deleteBuilding);

// Apartments
router.get('/apartments', adminController.listApartments);
router.post('/apartments', adminController.createApartment);
router.patch('/apartments/:id', adminController.updateApartment);
router.delete('/apartments/:id', adminController.deleteApartment);

// Rooms
router.get('/rooms', adminController.listRooms);
router.post('/rooms', adminController.createRoom);
router.patch('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

// Devices
router.get('/devices', adminController.listDevices);
router.post('/devices', adminController.createDevice);
router.patch('/devices/:id', adminController.updateDevice);
router.delete('/devices/:id', adminController.deleteDevice);

export default router;
