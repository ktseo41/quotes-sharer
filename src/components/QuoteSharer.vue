<script setup lang="ts">
import { computed, ref, unref, watch } from "vue";
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
const _presets = [
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
      <textarea ref="_content" class="content" spellcheck="false"></textarea>
      <div class="author-and-title">
        <h4 class="title">{{ titleText }}</h4>
        <span class="author">{{ authorText }}</span>
      </div>
    </div>
    <div class="bottom-bar">
      <div v-if="!presetsOn" class="configs">
        <img
          @click="togglePresets"
          src="../assets/ic_fluent_color_24_regular.svg"
          alt="프리셋변경"
        />
        <img
          src="../assets/ic_fluent_color_fill_24_regular.svg"
          alt="배경색변경"
        />
        <img
          src="../assets/ic_fluent_text_color_ga_24_regular.svg"
          alt="글자색변경"
        />
      </div>
      <div class="presets">
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

.author-and-title {
  display: table-cell;
  width: 100%;
  height: 3rem;
  vertical-align: bottom;

  .title {
    display: inline;
    margin-right: 0.5rem;
  }

  .author {
    font-size: 0.9rem;
  }
}

.bottom-bar {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;

  .configs {
    display: flex;

    & *:not(:first-child) {
      margin-left: 0.5rem;
    }

    & img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
    }
  }

  .toggle-presets {
    display: inline-flex;
    width: 2.5rem;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
    /* stylelint-disable-next-line declaration-colon-newline-after */
    background-image: linear-gradient(
      to right bottom,
      #d16ba5,
      #c777b9,
      #ba83ca,
      #aa8fd8,
      #9a9ae1,
      #8aa7ec,
      #79b3f4,
      #69bff8,
      #52cffe,
      #41dfff,
      #46eefa,
      #5ffbf1
    );
    border-radius: 0.5rem;
    color: #505050;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
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

      &:not(:nth-child(2)) {
        margin-left: 10px;
      }
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
