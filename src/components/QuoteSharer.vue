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
      const file = new File([blob], `${title.value}.png`, { type: blob.type });
      const text = `${titleText.value}${authorText.value}`;
      const options = {
        title: text,
        text: text,
        files: [file],
      };
      if (!navigator?.canShare?.(options)) {
        alert("지원하지 않는 브라우저입니다.");
        return;
      }
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
  padding-top: 40px;
  justify-items: center;
}

.wrapper {
  width: 20rem;
  height: 20rem;
}

textarea {
  display: block;
  width: 100%;
  height: calc(100% - 3rem);
  padding: 1rem 1rem 0;
  background-color: inherit;
  border-radius: 0;
  color: inherit;
  outline: none;
  resize: none;
}

.author-and-title {
  display: flex;
  width: 100%;
  height: 3rem;
  align-items: flex-end;
  padding: 0 1rem 1rem;

  .title {
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

  .presets {
    & span {
      display: inline-flex;
      width: 2.5rem;
      height: 2.5rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1.2rem;

      &:not(:first-child) {
        margin-left: 10px;
      }
    }
  }

  .buttons {
    display: flex;

    img {
      width: 1.8rem;
      height: 1.8rem;
    }

    img[alt="내보내기"] {
      margin-right: 1rem;
    }

    svg,
    img[alt="다운로드"] {
      margin-right: 0.6rem;
      cursor: pointer;
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
</style>
