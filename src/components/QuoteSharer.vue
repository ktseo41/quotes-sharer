<script setup lang="ts">
import { computed, ref, unref, watch } from "vue";
import domToImage from "dom-to-image";
import LoadingIcon from "../assets/LoadingIcon.vue";
import IconWithColors from "../assets/IconWithColors.vue";
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
const _presets = [
  {
    backgroundColor: "#fff4ea",
    textColor: "#2c2c2c",
  },
  {
    backgroundColor: "#fff",
    textColor: "#000",
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

const presets = ref<Preset[]>([]);

const bindColors = (preset: Preset) => {
  backgroundColor.value = preset.backgroundColor;
  textColor.value = preset.textColor;
};

const paragraphFontSize = ref(17);

const presetsOn = ref(false);

const togglePresets = () => {
  if (!presetsOn.value) {
    presetsOn.value = !presetsOn.value;
    const intervalId = setInterval(() => {
      const nextPreset = _presets.slice(
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
  if (counter === _presets.length) {
    presetsOn.value = false;
    counter = 0;
  }
};

const fontSizeSliderOn = ref(false);
const toggleFontSizeSliderOn = () => {
  fontSizeSliderOn.value = !fontSizeSliderOn.value;
};

const showTextCounts = ref(true);

// 이미지 다운로드 혹은 공유
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

function share() {
  if (!navigator?.canShare) {
    downloadImage();
    return;
  }
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

  toPng(sharing.value, param)
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
    })
    .catch((error) => {
      console.error(error);
      alert(error);
      isLoadingImage.value = false;
    });
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
      <textarea
        v-model="_content"
        class="content"
        spellcheck="false"
      ></textarea>
      <div class="sharing-bottom">
        <div class="author-and-title">
          <h4 class="title">{{ titleText }}</h4>
          <span class="author">{{ authorText }}</span>
        </div>
        <div v-if="showTextCounts" class="text-counts">
          {{ _content?.length }}
        </div>
      </div>
    </div>
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
          src="../assets/ic_fluent_arrow_ios_left_24.svg"
          @click="togglePresets"
          alt="닫기"
        />
        <transition-group
          @after-leave="checkIfCanHidePresets"
          name="list-complete"
        >
          <span
            v-for="({ textColor, backgroundColor: bgColor }, idx) in presets"
            :key="`${textColor.slice(0, 1)}-${idx}`"
            :style="{ color: textColor, backgroundColor: bgColor }"
            class="shadow-md preset-item"
            :class="{ 'shadow-inner': bgColor === backgroundColor }"
            @click="bindColors({ textColor, backgroundColor: bgColor })"
          >
            가
          </span>
        </transition-group>
      </div>
      <div v-if="fontSizeSliderOn" class="slider">
        <img
          src="../assets/ic_fluent_arrow_ios_left_24.svg"
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
          v-if="!isLoadingImage"
          class="rounded-full hover:bg-gray-200 hover:cursor-pointer"
          src="../assets/ic_fluent_share_ios_24_filled.svg"
          alt="내보내기"
          @click="share"
        />
        <LoadingIcon width="40" height="40" v-else />
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
</template>
<style lang="scss" scoped>
section {
  display: grid;
  justify-content: center;
  padding-top: 1rem;
  justify-items: center;
}

.wrapper {
  width: calc(100vw - 2rem);
  max-width: 25rem;
  height: calc(100vw - 2rem);
  max-height: 25rem;
  padding: 1rem;
}

textarea {
  display: block;
  width: 100%;
  height: calc(100% - 3rem);
  background-color: inherit;
  border-radius: 0;
  color: inherit;
  outline: none;
  resize: none;
}

.sharing-bottom {
  display: flex;
  align-items: flex-end;

  .author-and-title {
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 3rem;

    .title {
      display: inline;
      margin-right: 0.5rem;
    }

    .author {
      font-size: 0.9rem;
    }
  }

  .text-counts {
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
    align-items: center;
    flex-grow: 1;

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
      cursor: pointer;
      -webkit-appearance: none;
      background-color: #f5f5f5;
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
