import { FC, useEffect, useState } from "react";
import { ContactRow } from "./ContactRow";

async function getContacts() {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return ["Tom", "Alex", "Viki"];
}

export const ContactsList: FC = () => {
  const [contacts, setContacts] = useState<string[]>();

  useEffect(() => {
    getContacts().then(setContacts);
  }, []);

  return (
    <ul>
      {contacts?.map((contact) => (
        <li key={contact}>
          <ContactRow>{contact}</ContactRow>
        </li>
      ))}
    </ul>
  );
};
