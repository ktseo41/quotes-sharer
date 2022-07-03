<script setup lang="ts">
import { computed, ref } from "vue";
import domToImage from "dom-to-image";
import LoadingIcon from "../assets/LoadingIcon.vue";
const { toPng } = domToImage;

const content = ref("");
const _content = ref();

const title = ref("");
const titleText = computed(() =>
  title.value.length ? `『${title.value}』` : ""
);

const author = ref("");
const authorText = computed(() =>
  author.value.length ? `- ${author.value}` : ""
);

const backgroundColor = ref("#fff4ea");
const textColor = ref("#2c2c2c");

type Preset = {
  backgroundColor: string;
  textColor: string;
};
const presets = [
  {
    backgroundColor: "#fff4ea",
    textColor: "#2c2c2c",
  },
  {
    backgroundColor: "white",
    textColor: "black",
  },
  {
    backgroundColor: "#005f73",
    textColor: "#fafafa",
  },
  {
    backgroundColor: "#ffd885",
    textColor: "#004d05",
  },
];

const bindColors = (preset: Preset) => {
  backgroundColor.value = preset.backgroundColor;
  textColor.value = preset.textColor;
};

const paragraphFontSize = ref(17);

// 이미지 다운로드
const sharing = ref();
const isLoadingImage = ref(false);

const downloadImage = function () {
  const scale = 3;
  isLoadingImage.value = true;

  const style = {
    transform: "scale(" + scale + ")",
    transformOrigin: "top left",
    width: sharing.value.offsetWidth + "px",
    height: sharing.value.offsetHeight + "px",
  };

  const param = {
    height: sharing.value.offsetHeight * scale,
    width: sharing.value.offsetWidth * scale,
    quality: 1,
    style,
  };

  const link = document.createElement("a");
  link.download = title.value;

  toPng(sharing.value, param)
    .then((dataUrl) => {
      link.href = dataUrl || "다운로드";
      isLoadingImage.value = false;
      link.click();
    })
    .catch((error) => {
      console.error(error);
      isLoadingImage.value = false;
    });
};

// share
function share() {
  if (!navigator.canShare) {
    alert("지원하지 않는 브라우저입니다.");
    return;
  }

  const text = `${titleText.value}${authorText.value}`;
  const url = window.location.href;
  const file = sharing.value;
  const options = {
    title: text,
    text: text,
    url,
    file,
  };

  navigator.share(options);
}
</script>
<template>
  <section>
    <div
      ref="sharing"
      class="shadow-lg wrapper"
      :style="{
        color: textColor,
        backgroundColor,
        fontSize: `${paragraphFontSize}px`,
      }"
    >
      <textarea ref="_content" class="content" spellcheck="false"></textarea>
      <div class="author-and-title">
        <h4 class="title">{{ titleText }}</h4>
        <span class="author">{{ authorText }}</span>
      </div>
    </div>
    <div class="bottom-bar">
      <div class="presets">
        <span
          v-for="({ textColor, backgroundColor: bgColor }, idx) in presets"
          :key="`${textColor.slice(0, 1)}-${idx}`"
          :style="{ color: textColor, backgroundColor: bgColor }"
          class="shadow-md"
          :class="{ 'shadow-inner': bgColor === backgroundColor }"
          @click="bindColors({ textColor, backgroundColor: bgColor })"
        >
          가
        </span>
      </div>
      <img
        width="40"
        height="40"
        class="rounded-full hover:bg-gray-200 hover:cursor-pointer"
        src="../assets/ic_fluent_settings_24_filled.svg"
        alt="다운로드"
        @click="share"
      />
      <img
        v-if="!isLoadingImage"
        width="48"
        height="48"
        class="rounded-full hover:bg-gray-200 hover:cursor-pointer"
        src="../assets/ic_fluent_arrow_downloaded_24_filled.svg"
        alt="다운로드"
        @click="downloadImage"
      />
      <LoadingIcon width="40" height="40" v-else />
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
</template>
<style lang="scss" scoped>
section {
  display: grid;
  justify-content: center;
  padding-top: 40px;
}

.content {
  width: 90vw;
  max-width: 350px;
  height: 75vw;
  box-sizing: border-box;
  padding: 12px 20px 0;
  background-color: initial;
  border-radius: 0;
  color: initial;
  outline: none;
  resize: none;
}

.author-and-title {
  display: flex;
  height: 15vw;
  align-items: center;
  padding: 20px;

  .title {
    margin-right: 5px;
  }

  .author {
    font-size: 13px;
  }
}

.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;

  .presets {
    & span {
      display: inline-flex;
      width: 8vw;
      max-width: 25px;
      height: 8vw;
      max-height: 25px;
      box-sizing: border-box;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1.2rem;

      &:not(:first-child) {
        margin-left: 10px;
      }
    }
  }

  img[alt="다운로드"] {
    width: 8vw;
    height: 8vw;
    margin-right: 8px;
    cursor: pointer;
  }
}

.additional-infos {
  margin: 8px 0 0 4px;
}
</style>
