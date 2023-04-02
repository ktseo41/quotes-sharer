import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export default function useLogin() {
  const isCallbackUrl = window.location.href.includes("code=");
  const redirectUrl = import.meta.env.DEV
    ? import.meta.env.VITE_LOCAL_HOST
    : "https://ktseo41.github.io/quotes-sharer/";
  const state = uuidv4();
  const isLoggedIn = ref(false);

  async function login() {
    localStorage.setItem(state, "true");
    // @ts-ignore
    window.location = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${
      import.meta.env.VITE_NAVER_AUTH_CLIENT_ID
    }&state=${encodeURIComponent(state)}&redirect_uri=${redirectUrl}`;
  }

  async function auth() {
    const baseUrl = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_SERVER
      : "";
    const code = window.location.href.split("code=")[1];
    const state = decodeURIComponent(window.location.href.split("state=")[1]);
    const isLocalStateExists = localStorage.getItem(state) === "true";

    try {
      if (!isLocalStateExists) {
        alert("유효하지 않은 인증 응답입니다.");
        return;
      }

      localStorage.removeItem(state);

      const { status } = await fetch(`${baseUrl}/auth?code=${code}`, {
        credentials: "include",
      });

      if (status !== 200) {
        throw new Error("auth failed");
      }

      isLoggedIn.value = true;
    } catch (error) {
      isLoggedIn.value = false;
      console.error(error);
    } finally {
      // delete query strings
      window.history.pushState({}, "", window.location.pathname);
    }
  }

  async function checkIfLoggedIn() {
    const baseUrl = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_SERVER
      : "";

    try {
      const response = await fetch(`${baseUrl}/ping`, {
        credentials: "include",
      });

      if (response.status !== 200) {
        throw new Error("Not logged in");
      }

      isLoggedIn.value = true;
    } catch (error) {
      console.error(error);
      isLoggedIn.value = false;
    }
  }

  return {
    isCallbackUrl,
    checkIfLoggedIn,
    login,
    auth,
    isLoggedIn,
  };
}
