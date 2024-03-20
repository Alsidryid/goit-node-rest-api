import express from "express";
import contactsController from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();

contactsRouter.get("/", contactsController.getAllContacts);

contactsRouter.get("/:id", contactsController.getOneContact);

contactsRouter.delete("/:id", contactsController.deleteContact);

contactsRouter.post("/", contactsController.createContact);

contactsRouter.put("/:id", contactsController.updateContact);

export default contactsRouter;
