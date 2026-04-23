// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPasswordMock = vi.fn();
const signUpMock = vi.fn();

vi.mock("../src/resources/config/config", () => ({
  default: {
    supabaseClient: {
      auth: {
        signInWithPassword: (...args: unknown[]) => signInWithPasswordMock(...args),
        signUp: (...args: unknown[]) => signUpMock(...args),
      },
    },
  },
}));

vi.mock("../src/auth/AuthSessionProvider", () => ({
  useAuthSession: () => ({
    status: "anonymous",
    startOAuth: vi.fn(),
  }),
}));

vi.mock("../src/components/hushh-tech-header/HushhTechHeader", () => ({
  default: () => React.createElement("div", null, "header"),
}));

vi.mock("../src/components/hushh-tech-footer/HushhTechFooter", () => ({
  default: () => React.createElement("div", null, "footer"),
}));

vi.mock("../src/components/images/Hushhogo.png", () => ({
  default: "logo.png",
}));

import LoginPage from "../src/pages/login/ui";
import SignupPage from "../src/pages/signup/ui";

describe("Email Authentication (Login & Signup)", () => {
  let container: HTMLDivElement;
  let root: Root;

  const flush = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  const getLoginInputs = () => {
    const inputs = container.querySelectorAll("input");
    return {
      email: Array.from(inputs).find(i => i.type === "email" || i.id === "login-email") as HTMLInputElement,
      password: Array.from(inputs).find(i => i.type === "password" || i.id === "login-password") as HTMLInputElement,
      submit: container.querySelector("form button[type='submit']") as HTMLButtonElement,
    };
  };

  const getSignupInputs = () => {
    const inputs = container.querySelectorAll("input");
    return {
      email: Array.from(inputs).find(i => i.type === "email" || i.id === "signup-email") as HTMLInputElement,
      password: Array.from(inputs).find(i => i.type === "password" && i.id === "signup-password") as HTMLInputElement,
      confirmPassword: Array.from(inputs).find(i => i.type === "password" && i.id === "signup-confirm-password") as HTMLInputElement,
      submit: container.querySelector("form button[type='submit']") as HTMLButtonElement,
    };
  };

  describe("Login", () => {
    it("shows validation error for missing fields and does not clear URL", async () => {
      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(LoginPage))
        );
      });
      await flush();

      const { submit } = getLoginInputs();
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(container.textContent).toContain("Please enter both email and password.");
      expect(signInWithPasswordMock).not.toHaveBeenCalled();
    });

    it("handles Supabase sign-in errors", async () => {
      signInWithPasswordMock.mockResolvedValue({ error: { message: "Invalid credentials." } });

      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(LoginPage))
        );
      });
      await flush();

      const { email, password, submit } = getLoginInputs();
      
      await act(async () => {
        email.value = "test@example.com";
        email.dispatchEvent(new Event("change", { bubbles: true }));
        password.value = "wrongpassword";
        password.dispatchEvent(new Event("change", { bubbles: true }));
      });
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(signInWithPasswordMock).toHaveBeenCalledWith({ email: "test@example.com", password: "wrongpassword" });
      expect(container.textContent).toContain("Invalid credentials.");
    });

    it("handles successful login without errors", async () => {
      signInWithPasswordMock.mockResolvedValue({ error: null, data: { user: { id: "123" } } });

      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(LoginPage))
        );
      });
      await flush();

      const { email, password, submit } = getLoginInputs();
      
      await act(async () => {
        email.value = "test@example.com";
        email.dispatchEvent(new Event("change", { bubbles: true }));
        password.value = "correctpassword";
        password.dispatchEvent(new Event("change", { bubbles: true }));
      });
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(signInWithPasswordMock).toHaveBeenCalled();
      expect(container.textContent).not.toContain("Please enter both email and password.");
    });
  });

  describe("Signup", () => {
    it("shows validation error for missing fields", async () => {
      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(SignupPage))
        );
      });
      await flush();

      const { submit } = getSignupInputs();
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(container.textContent).toContain("Please fill in all fields.");
      expect(signUpMock).not.toHaveBeenCalled();
    });

    it("shows validation error when passwords do not match", async () => {
      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(SignupPage))
        );
      });
      await flush();

      const { email, password, confirmPassword, submit } = getSignupInputs();
      
      await act(async () => {
        email.value = "test@example.com";
        email.dispatchEvent(new Event("change", { bubbles: true }));
        password.value = "password123";
        password.dispatchEvent(new Event("change", { bubbles: true }));
        confirmPassword.value = "password321";
        confirmPassword.dispatchEvent(new Event("change", { bubbles: true }));
      });
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(container.textContent).toContain("Passwords do not match.");
      expect(signUpMock).not.toHaveBeenCalled();
    });

    it("handles Supabase signup errors", async () => {
      signUpMock.mockResolvedValue({ error: { message: "Email already taken." } });

      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(SignupPage))
        );
      });
      await flush();

      const { email, password, confirmPassword, submit } = getSignupInputs();
      
      await act(async () => {
        email.value = "test@example.com";
        email.dispatchEvent(new Event("change", { bubbles: true }));
        password.value = "password123";
        password.dispatchEvent(new Event("change", { bubbles: true }));
        confirmPassword.value = "password123";
        confirmPassword.dispatchEvent(new Event("change", { bubbles: true }));
      });
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(signUpMock).toHaveBeenCalled();
      expect(container.textContent).toContain("Email already taken.");
    });

    it("shows success message when session is not immediately returned", async () => {
      signUpMock.mockResolvedValue({ error: null, data: { session: null, user: { id: "123" } } });

      await act(async () => {
        root.render(
          React.createElement(MemoryRouter, null, React.createElement(SignupPage))
        );
      });
      await flush();

      const { email, password, confirmPassword, submit } = getSignupInputs();
      
      await act(async () => {
        email.value = "test@example.com";
        email.dispatchEvent(new Event("change", { bubbles: true }));
        password.value = "password123";
        password.dispatchEvent(new Event("change", { bubbles: true }));
        confirmPassword.value = "password123";
        confirmPassword.dispatchEvent(new Event("change", { bubbles: true }));
      });
      
      await act(async () => {
        submit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await flush();

      expect(signUpMock).toHaveBeenCalled();
      expect(container.textContent).toContain("Check your inbox to confirm your email address.");
    });
  });
});
