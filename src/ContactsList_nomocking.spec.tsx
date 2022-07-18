import { describe, expect, test, vi } from "vitest";
import { ContactRow } from "./ContactRow";
import { ContactsList } from "./ContactsList";
import { mount, waitFor } from "./testUtils";

describe("ContactsList_nomocking", () => {
  test("renders", async () => {
    const wrapper = mount(<ContactsList />);
    await waitFor(() => {
      expect(wrapper.find(ContactRow).exists()).toBe(true);
    });
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(ContactRow)).toMatchSnapshot();
  });
});
