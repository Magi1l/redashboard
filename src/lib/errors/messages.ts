export const errorMessages = {
  BE4001: {
    ko: "디스코드 ID와 서버 ID가 필요합니다. 다시 시도해 주세요.",
    en: "Discord ID and server ID are required. Please try again.",
  },
  BE4002: {
    ko: "디스코드 ID와 배경 이미지 URL이 필요합니다.",
    en: "Discord ID and background image URL are required.",
  },
  BE4050: {
    ko: "허용되지 않은 요청 방식입니다.",
    en: "Method not allowed.",
  },
  BE1000: {
    ko: "일시적인 서버 오류입니다. 잠시 후 다시 시도해 주세요.",
    en: "Temporary server error. Please try again later.",
  },
  default: {
    ko: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    en: "An unknown error occurred. Please try again later.",
  },
};

export function getErrorMessage(code: string, lang: "ko" | "en" = "ko") {
  return errorMessages[code]?.[lang] || errorMessages.default[lang];
} 