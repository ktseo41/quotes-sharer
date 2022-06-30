<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
// import { toPng } from "html-to-image";
import domToImage from "dom-to-image";
import LoadingIcon from "../assets/LoadingIcon.vue";
const { toPng } = domToImage;

const content = ref("");

const title = ref("");
const titleText = computed(() =>
  title.value.length ? `⟪ ${title.value} ⟫` : ""
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

onMounted(() => {
  sharing.value.focus();
});
</script>
<template>
  <section>
    <textarea
      ref="sharing"
      class="shadow-lg"
      spellcheck="false"
      :style="{
        color: textColor,
        backgroundColor,
        fontSize: `${paragraphFontSize}px`,
      }"
    ></textarea>
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
  </section>
</template>
<style lang="scss" scoped>
section {
  display: grid;
  justify-content: center;
  padding-top: 40px;
}

textarea {
  width: 90vw;
  height: 90vw;
  max-width: 350px;
  padding: 12px 20px;
  box-sizing: border-box;
  outline: none;
  border-radius: 0;
  resize: vertical;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  .presets {
    & span {
      width: 8vw;
      height: 8vw;
      max-width: 25px;
      max-height: 25px;
      display: inline-flex;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      font-size: 1.2rem;
      padding: 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;

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
</style>
