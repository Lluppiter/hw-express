const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");

const contactPath = path.join(__dirname, "/contacts.json");

const writeContacts = async (data) =>
  await fs.writeFile(contactPath, JSON.stringify(data, null, 2));

const listContacts = async () => {
  const data = await fs.readFile(contactPath);
  return JSON.parse(data);
};

const getContactById = async (contactId) => {
  const data = await listContacts();
  const contact = data.filter((elem) => elem.id === contactId.toString());
  return contact || null;
};

const removeContact = async (contactId) => {
  const data = await listContacts();
  const index = data.findIndex((item) => item.id === contactId.toString());
  console.log(index);
  if (index === -1) {
    return null;
  }
  const [result] = data.splice(index, 1);
  await writeContacts(data);
  return result;
};

const addContact = async (body) => {
  const data = await listContacts();
  const newContact = {
    id: nanoid(),
    name: body.name,
    email: body.email,
    phone: body.phone,
  };
  data.push(newContact);
  await writeContacts(data);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const data = await listContacts();
  const index = data.findIndex((item) => item.id === contactId.toString());
  if (index === -1) {
    return null;
  }
  data[index] = { contactId, ...body };
  await writeContacts(data);
  return data[index];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
