import { useCallback, useRef } from "react";

const authPath = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/auth`;

export default function HomePage() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const addAuthLinks = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    const navigation = document?.querySelector<HTMLElement>(".navlinks");

    if (!document || !navigation) return;

    if (!navigation.querySelector(".contact-us-link")) {
      const contactLink = document.createElement("a");
      contactLink.href = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/contact-us`;
      contactLink.target = "_top";
      contactLink.className = "contact-us-link";
      contactLink.textContent = "Contact Us";
      navigation.append(contactLink);
    }

    if (navigation.querySelector(".auth-actions")) return;

    const actions = document.createElement("div");
    actions.className = "auth-actions";

    const loginLink = document.createElement("a");
    loginLink.href = authPath;
    loginLink.target = "_top";
    loginLink.className = "btn outline";
    loginLink.textContent = "Log in";

    const registerLink = document.createElement("a");
    registerLink.href = `${authPath}?mode=signup`;
    registerLink.target = "_top";
    registerLink.className = "btn light";
    registerLink.textContent = "Register";

    actions.append(loginLink, registerLink);
    navigation.append(actions);

    const style = document.createElement("style");
    style.textContent = `
      .auth-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 8px;
      }
      .auth-actions .btn {
        gap: 8px;
        padding: 9px 14px;
        white-space: nowrap;
      }
      @media (max-width: 720px) {
        .navlinks.open .auth-actions {
          width: 100%;
          margin: 8px 0 0;
        }
        .navlinks.open .auth-actions .btn {
          flex: 1;
        }
      }
    `;
    document.head.append(style);

    actions.addEventListener("click", () => {
      navigation.classList.remove("open");
      const menu = document.querySelector<HTMLButtonElement>("#menu");
      menu?.setAttribute("aria-expanded", "false");
      menu?.setAttribute("aria-label", "Open navigation");
    });
  }, []);

  return (
    <main className="min-h-[100dvh] w-full bg-[#f7f6ef]">
      <iframe
        ref={frameRef}
        title="MyIFA — On your side. By your choice."
        src={`${import.meta.env.BASE_URL}myifa-homepage.html`}
        className="block h-[100dvh] w-full border-0"
        onLoad={addAuthLinks}
      />
    </main>
  );
}
