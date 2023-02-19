<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from "vue";
import domToImage from "dom-to-image";
import IconWithColors from "./components/IconWithColors.vue";
import QuoteContent from "./components/QuoteContent.vue";
import useLogin from "./hooks/login";
import PureQuote from "./components/PureQuote.vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
} from "@headlessui/vue";
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_PRESETS,
} from "./constants";
const { toPng } = domToImage;

type Preset = {
  backgroundColor: string;
  textColor: string;
};

const content = ref("");
const title = ref("");
const author = ref("");
const backgroundColor = ref(DEFAULT_BACKGROUND_COLOR);
const textColor = ref(DEFAULT_TEXT_COLOR);
const modifiedAt = ref("");
const paragraphFontSize = ref(DEFAULT_FONT_SIZE);
const showTextCounts = ref(true);

watch(
  [
    () => content.value,
    () => title.value,
    () => author.value,
    () => backgroundColor.value,
    () => textColor.value,
  ],
  () => {
    modifiedAt.value = new Date().toLocaleTimeString();
  }
);

const presets = ref<Preset[]>([]);

const bindColors = (preset: Preset) => {
  backgroundColor.value = preset.backgroundColor;
  textColor.value = preset.textColor;
};

const presetsOn = ref(false);

const togglePresets = () => {
  if (!presetsOn.value) {
    presetsOn.value = !presetsOn.value;
    const intervalId = setInterval(() => {
      const nextPreset = DEFAULT_PRESETS.slice(
        presets.value.length,
        presets.value.length + 1
      );

      if (nextPreset.length) {
        presets.value.push(nextPreset[0]);
      } else {
        clearInterval(intervalId);
      }
    }, 30);
    return;
  }

  const intervalId = setInterval(() => {
    presets.value.pop();

    if (!presets.value.length) {
      clearInterval(intervalId);
    }
  }, 30);
};

let counter = 0;
const checkIfCanHidePresets = () => {
  counter++;
  if (counter === DEFAULT_PRESETS.length) {
    presetsOn.value = false;
    counter = 0;
  }
};

const fontSizeSliderOn = ref(false);
const toggleFontSizeSliderOn = () => {
  fontSizeSliderOn.value = !fontSizeSliderOn.value;
};

// 이미지 다운로드 혹은 공유
const sharing = ref();
const isLoadingImage = ref(false);

const downloadImage = function () {
  const scale = 3;
  isLoadingImage.value = true;

  const style = {
    transform: "scale(" + scale + ")",
    transformOrigin: "top left",
    width: sharing.value.contentRef.offsetWidth + "px",
    height: sharing.value.contentRef.offsetHeight + "px",
  };

  const param = {
    height: sharing.value.contentRef.offsetHeight * scale,
    width: sharing.value.contentRef.offsetWidth * scale,
    quality: 1,
    style,
  };

  const link = document.createElement("a");
  link.download = title.value;

  toPng(sharing.value.contentRef, param)
    .then((dataUrl) => {
      link.href = dataUrl || "다운로드";
      isLoadingImage.value = false;
      showTextCounts.value = true;
      link.click();
    })
    .catch((error) => {
      console.error(error);
      isLoadingImage.value = false;
      showTextCounts.value = true;
    });
};

function share() {
  showTextCounts.value = false;

  if (!navigator?.canShare) {
    downloadImage();
    return;
  }
  const scale = 3;
  isLoadingImage.value = true;

  const style = {
    transform: "scale(" + scale + ")",
    transformOrigin: "top left",
    width: sharing.value.contentRef.offsetWidth + "px",
    height: sharing.value.contentRef.offsetHeight + "px",
  };

  const param = {
    height: sharing.value.contentRef.offsetHeight * scale,
    width: sharing.value.contentRef.offsetWidth * scale,
    quality: 1,
    style,
  };

  toPng(sharing.value.contentRef, param)
    .then(async (dataUrl: string) => {
      // https://stackoverflow.com/questions/61250048/how-to-share-a-single-base64-url-image-via-the-web-share-api
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${title.value || "Untitled"}.png`, {
        type: blob.type,
      });
      const options = {
        files: [file],
      };
      navigator.share(options);
      isLoadingImage.value = false;
      showTextCounts.value = true;
    })
    .catch((error) => {
      console.error(error);
      alert(error);
      isLoadingImage.value = false;
      showTextCounts.value = true;
    });
}

const { isLoggedIn, checkIfLoggedIn, isCallbackUrl, login, auth } = useLogin();

if (isCallbackUrl) {
  auth();
}

onMounted(() => {
  checkIfLoggedIn();
});

const showPreviousQuotes = ref(false);
const contentsRef = ref<HTMLDivElement | null>(null);
const quotesEls = ref<{ contentRef: HTMLDivElement }[]>([]);
const allQuotesAreMounted = ref(false);
const mountedArr = ref<number[]>([]);

watchEffect(() => {
  if (!quotesEls.value.length) return;

  allQuotesAreMounted.value =
    quotesEls.value.length === mountedArr.value.length;

  if (allQuotesAreMounted.value) {
    setQuotesStyles();
  }
});

const setQuotesStyles = () => {
  if (quotesEls.value.length === 0) return;

  quotesEls.value.forEach((el) => {
    if (!el.contentRef) return;

    const rect = el.contentRef.getBoundingClientRect();
    const centerY = window.innerHeight / 2;
    const y = rect.top + rect.height / 2;
    const distance = Math.abs(centerY - y);
    const scale = Math.max(0, 1 - Math.pow(distance / window.innerHeight, 2));
    const translateY = centerY - y > 0 ? (1 - scale) * 100 : -(1 - scale) * 100;
    const isCenter = Math.abs(distance) < 150;

    el.contentRef.style.transform = `scale(${scale}) translateY(${translateY}%)`;
    el.contentRef.style.position = "relative";

    if (isCenter) {
      el.contentRef.style.zIndex = "11";
    } else if (Math.abs(distance) < 300) {
      el.contentRef.style.zIndex = "10";
    } else {
      el.contentRef.style.zIndex = "0";
    }
  });
};

const closeModal = () => {
  showPreviousQuotes.value = false;
  mountedArr.value = [];
};
type Quote = {
  content: string;
  title?: string;
  author?: string;
  backgroundColor?: string;
  textColor?: string;
  paragraphFontSize?: number;
};

const previousQuotes = ref<Quote[]>([]);

const loadQuote = (quote: Quote) => {
  title.value = quote.title || "";
  author.value = quote.author || "";
  backgroundColor.value = quote.backgroundColor || "";
  textColor.value = quote.textColor || "";
  paragraphFontSize.value = Number(quote.paragraphFontSize) || 1;
  sharing.value.content = quote.content || "";
  closeModal();
};

// TODO: 개발, 프로덕션 API 분기
async function load() {
  try {
    const response = await fetch(`http://localhost:8080/load`, {
      credentials: "include",
    });
    const data = await response.json();
    previousQuotes.value = data;
    showPreviousQuotes.value = true;
  } catch (error) {
    console.error(error);
  }
}

// TODO: 개발, 프로덕션 API 분기
async function save() {
  if (!content.value) {
    alert("내용을 입력해주세요.");
    return;
  }
  try {
    await fetch(`http://localhost:8080/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: title.value,
        content: content.value,
        backgroundColor: backgroundColor.value,
        textColor: textColor.value,
        paragraphFontSize: paragraphFontSize.value,
      }),
    });
  } catch (error) {
    console.error(error);
  }
}
</script>
<template>
  <section>
    <div class="header">
      <div class="modified-at">
        <span v-if="modifiedAt">{{ modifiedAt }}에 수정됨</span>
      </div>
      <img
        v-if="!isLoggedIn"
        src="@/assets/naver_login_button.png"
        alt="로그인하기"
        @click="login"
      />
      <span
        v-else
        class="logged-in justify-self-end self-end text-[#212121] hover:underline text-underline-offset-2"
        @click="load"
        >이전 기록 불러오기</span
      >
    </div>
    <QuoteContent
      ref="sharing"
      @update:content="content = $event"
      :title="title"
      :author="author"
      :textColor="textColor"
      :backgroundColor="backgroundColor"
      :contentFontSize="paragraphFontSize"
      :showTextCount="showTextCounts"
    >
    </QuoteContent>
    <div class="bottom-bar">
      <div v-if="!presetsOn && !fontSizeSliderOn" class="configs">
        <IconWithColors
          iconName="brush"
          :colors="[
            '#005F73',
            '#29698E',
            '#5670A2',
            '#8575AD',
            '#B178AD',
            '#D77EA2',
          ]"
          @click="togglePresets"
        ></IconWithColors>
        <label for="background-color">
          <IconWithColors
            iconName="colorBackground"
            :colors="['#2c3e50']"
          ></IconWithColors>
          <input
            type="color"
            v-model="backgroundColor"
            name="background-color"
            id="background-color"
          />
        </label>
        <label for="text-color">
          <IconWithColors
            iconName="colorText"
            :colors="['#2c3e50']"
          ></IconWithColors>
          <input
            type="color"
            v-model="textColor"
            name="text-color"
            id="text-color"
          />
        </label>
        <IconWithColors
          iconName="fontSize"
          :colors="['#2c3e50']"
          @click="toggleFontSizeSliderOn"
        >
        </IconWithColors>
      </div>
      <div v-if="presetsOn" class="presets">
        <img
          v-show="presetsOn"
          src="@/assets/ic_fluent_arrow_ios_left_24.svg"
          @click="togglePresets"
          alt="닫기"
        />
        <transition-group
          @after-leave="checkIfCanHidePresets"
          name="list-complete"
        >
          <span
            v-for="(preset, idx) in presets"
            :key="`${textColor.slice(0, 1)}-${idx}`"
            :style="{
              color: textColor,
              backgroundColor: preset.backgroundColor,
            }"
            class="shadow-md preset-item"
            :class="{
              'shadow-inner': preset.backgroundColor === backgroundColor,
            }"
            @click="
              bindColors({ textColor, backgroundColor: preset.backgroundColor })
            "
          >
            가
          </span>
        </transition-group>
      </div>
      <div v-if="fontSizeSliderOn" class="slider">
        <img
          src="@/assets/ic_fluent_arrow_ios_left_24.svg"
          @click="toggleFontSizeSliderOn"
          alt="닫기"
        />
        <div v-if="fontSizeSliderOn" class="slider">
          <input
            v-model="paragraphFontSize"
            type="range"
            name="paragraph-font-size"
            id="paragraph-font-size"
          />
          <input v-model="paragraphFontSize" type="number" />
        </div>
      </div>
      <div class="buttons">
        <img
          v-if="isLoggedIn"
          class="rounded-full hover:bg-gray-200 hover:cursor-pointer"
          src="@/assets/ic_fluent_save_24_filled.svg"
          alt="저장하기"
          @click="save"
        />
        <img
          v-if="!isLoadingImage"
          class="rounded-full hover:bg-gray-200 hover:cursor-pointer"
          src="@/assets/ic_fluent_share_ios_24_filled.svg"
          alt="내보내기"
          @click="share"
        />
        <img
          v-else
          width="40"
          height="40"
          src="@/assets/loading.svg"
          alt="내보내는중"
        />
      </div>
    </div>
    <div class="additional-infos">
      <h3 class="mb-1 mt-3 font-semibold">책</h3>
      <input
        class="border rounded px-2 py-1"
        type="text"
        v-model="title"
        name="author"
        id="author"
      />
      <h3 class="mb-1 mt-3 font-semibold">저자</h3>
      <input
        class="border rounded px-2 py-1"
        type="text"
        v-model="author"
        name="author"
        id="author"
      />
    </div>
  </section>
  <TransitionRoot appear :show="showPreviousQuotes" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10"
      >,
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>
      <div
        ref="contentsRef"
        @scroll="setQuotesStyles"
        class="fixed inset-0 overflow-y-auto"
      >
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <DialogPanel
            ref="previousQuotesRef"
            @click="closeModal"
            class="w-full max-w-md mt-[calc(50vh_-_179px)] transform overflow-hidden text-left align-middle transition-all"
          >
            <PureQuote
              ref="quotesEls"
              v-for="(quote, idx) in previousQuotes"
              class="ease-in-out duration-50"
              @mounted="(mounted) => (mounted ? mountedArr.push(idx) : null)"
              :id="`pure-${idx}`"
              :key="quote.content + idx"
              @click="loadQuote(quote)"
              :content="quote.content"
              :author="quote.author"
              :title="quote.title"
              :textColor="quote.textColor"
              :backgroundColor="quote.backgroundColor"
              :contentFontSize="Number(quote.paragraphFontSize)"
            ></PureQuote>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
<style lang="scss" scoped>
section {
  display: grid;
  justify-content: center;
  padding-top: 1rem;
  justify-items: center;
}

.header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  margin-bottom: 10px;
  cursor: pointer;
  height: 40px;

  .modified-at {
    color: rgb(224, 224, 224);
    justify-self: start;
    align-self: end;
  }

  img {
    height: 40px;
    justify-self: end;
  }
}

.sharing-bottom {
  width: 100%;
  display: table;

  .author-and-title {
    display: table-cell;
    vertical-align: bottom;
    height: 3rem;
    width: 96%;

    .title {
      display: inline;
      margin-right: 0.5rem;
    }

    .author {
      font-size: 0.9rem;
    }
  }

  .text-counts {
    display: table-cell;
    vertical-align: bottom;
    color: #999;
    font-size: 0.7rem;
  }
}

.bottom-bar {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;

  .configs {
    position: relative;
    display: flex;

    & > *:not(:first-child) {
      margin-left: 0.5rem;
    }

    .icon-with-colors,
    img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    label {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    input[type="color"] {
      position: absolute;
      bottom: -7px;
      width: 1.1rem;
      height: 0.4rem;
      border-radius: 3px;
    }

    input[type="color"]::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    input[type="color"]::-webkit-color-swatch {
      border: none;
    }
  }

  .presets {
    display: flex;
    align-items: center;

    & img {
      display: inline-flex;
      width: 2.8rem;
      height: 2.8rem;
      padding: 0.5rem;
      cursor: pointer;
    }

    & span {
      display: inline-flex;
      width: 2.5rem;
      height: 2.5rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: bold;

      &:not(:nth-child(2)) {
        margin-left: 10px;
      }
    }
  }

  .slider {
    display: flex;
    flex-grow: 1;
    align-items: center;

    & img {
      display: inline-flex;
      width: 2.8rem;
      height: 2.8rem;
      padding: 0.5rem;
      cursor: pointer;
    }

    input[type="range"] {
      width: 100%;
      height: 0.5rem;
      appearance: none;
      background-color: #f5f5f5;
      cursor: pointer;
    }

    input[type="number"] {
      width: 3.2rem;
      padding: 0.5rem;
      margin-left: 0.5rem;
    }
  }

  .buttons {
    display: flex;

    svg {
      width: 2.8rem;
      height: 2.8rem;
    }

    img {
      width: 2.8rem;
      height: 2.8rem;
      padding: 0.5rem;
    }
  }
}

.additional-infos {
  width: 100%;
  margin-top: 1.5rem;

  & input {
    width: 65%;
  }
}

// animation
.list-complete-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-complete-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-complete-enter-active {
  transition: all 0.1s ease;
}

.list-complete-leave-active {
  transition: all 0.1s ease;
}
</style>
