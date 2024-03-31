import Contact from "../models/Contact.js";

const listContacts = (filter = {}, settings = {}) =>
  Contact.find(filter, "-createdAt -updatedAt", settings).populate(
    "owner",
    "username email"
  );

const addContact = (data) => Contact.create(data);

const getContactByFilter = (filter) => {
  const data = Contact.findOne(filter);
  return data;
};

const updateContactFilter = async (filter, data) =>
  Contact.findOneAndUpdate(filter, data);

const removeContactFilter = (filter) => Contact.findOneAndDelete(filter);

const countContacts = (filter) => Contact.countDocuments(filter);

export {
  listContacts,
  getContactByFilter,
  addContact,
  removeContactFilter,
  updateContactFilter,
  countContacts,
};
