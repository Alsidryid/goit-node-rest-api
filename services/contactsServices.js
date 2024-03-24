import Contact from "../models/Contact.js";

const listContacts = () => Contact.find({}, "-createdAt -updatedAt");

const addContact = (data) => Contact.create(data);

const getContactById = async (id) => {
  const data = await Contact.findById(id);
  return data;
};

const updateContact = async (id, data) => Contact.findByIdAndUpdate(id, data);

const removeContact = (id) => Contact.findByIdAndDelete(id);

export {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
