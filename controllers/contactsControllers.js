import * as contactsService from "../services/contactsServices.js";
import ctrlWrapper from "../decorator/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusSchema,
} from "../schemas/contactsSchemas.js";

const getAllContacts = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const { favorite } = req.query;
  const skip = (page - 1) * limit;
  if (!favorite) {
    const total = await contactsService.countContacts({ owner });
    const result = await contactsService.listContacts(
      { owner },
      { skip, limit }
    );

    return res.json({ result, total });
  }

  const total = await contactsService.countContacts({ owner, favorite });
  const result = await contactsService.listContacts(
    { owner, favorite },
    { skip, limit }
  );

  res.json({ result, total });
};

const getOneContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await contactsService.getContactByFilter({ owner, _id: id });
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await contactsService.removeContactFilter({ owner, _id: id });
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

const createContact = async (req, res) => {
  const { error } = createContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { _id: owner } = req.user;
  const result = await contactsService.addContact({ ...req.body, owner });
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { error } = updateContactSchema.validate(req.body);

  if (error) {
    throw HttpError(400, error.message);
  }
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await contactsService.updateContactFilter(
    { owner, _id: id },
    req.body
  );
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { error } = updateStatusSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await contactsService.updateContactFilter(
    { owner, _id: id },
    req.body
  );
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  deleteContact: ctrlWrapper(deleteContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
