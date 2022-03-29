<script setup lang="ts">
import { computed, ref } from "vue";
import { toPng } from "html-to-image";
import LoadingIcon from "../assets/LoadingIcon.vue";

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
    backgroundColor: "white",
    textColor: "black",
  },
  {
    backgroundColor: "#fff4ea",
    textColor: "#2c2c2c",
  },
  {
    backgroundColor: "#005f73",
    textColor: "#fafafa",
  },
];

const bindColors = (preset: Preset) => {
  backgroundColor.value = preset.backgroundColor;
  textColor.value = preset.textColor;
};

const paragraphFontSize = ref(15);

//
const sharing = ref();
const isLoadingImage = ref(false);

const downloadImage = function () {
  isLoadingImage.value = true;

  toPng(sharing.value)
    .then(function (dataUrl) {
      const link = document.createElement("a");
      link.download = title.value;
      link.href = dataUrl;
      link.click();
      isLoadingImage.value = false;
    })
    .catch(function (error) {
      console.error(error);
      isLoadingImage.value = false;
    });
};
</script>
<template>
  <section>
    <div class="wrapper">
      <article ref="sharing" :style="{ backgroundColor }">
        <p :style="{ color: textColor, fontSize: `${paragraphFontSize}px` }">
          &nbsp;{{ content }}
          <!-- “... 세네카가 말했어. 삶이 짧은 것이 아니라 우리가 시간을 낭비한다고."
        그런데 이 말을 꼭 속으로 뭔가를 억누르면서 한다. 이건 말뿐이고 현실
        세계의 나는 늘 삶을 낭비한다. 늘 쓸데없는 일에 힘을 빼앗긴다. 늘 하고
        싶은 일이 아니라 하고 싶지 않은 일을 더 많이 한다. ... 후회하지 않을
        삶을 살아보고 싶은데 잘 안 된다. 나는 의미 없이 흘러가는 시간을
        아쉬워하는 사람의 괴로움을 겪는다. 더 슬픈 것은 정열을 기울인 많은 일이
        무의미로 끝났다는 점이다. 열정적으로 무의미한 일을 하느라 최소한 다른
        무의미한 일을 하지는 않았다 정도로 위안을 삼아야 할까? -->
        </p>
        <div :style="{ color: textColor }">
          <h4>{{ titleText }}</h4>
          <span>{{ authorText }}</span>
        </div>
        <!--   <img height="350" width="350" src="http://image.kyobobook.co.kr/images/book/xlarge/933/x9788955824933.jpg" alt="a"> -->
      </article>
    </div>
    <div class="config">
      <div>
        <h3>내용</h3>
        <textarea v-model="content" name="content" cols="30" rows="12">
        </textarea>
        <h3>책</h3>
        <input v-model="title" type="text" name="book" id="book" />
        <h3>저자</h3>
        <input v-model="author" type="text" name="author" id="author" />
        <br />
        <br />
        <h3>배경색</h3>
        <input
          v-model="backgroundColor"
          type="color"
          name="backgroundColorColor"
          id="backgroundColorColor"
        />
        <input
          v-model="backgroundColor"
          type="text"
          name="backgroundColorText"
          id="backgroundColorText"
        />
        <h3>글자색</h3>
        <input
          v-model="textColor"
          type="color"
          name="textColorColor"
          id="textColorColor"
        />
        <input
          v-model="textColor"
          type="text"
          name="textColorText"
          id="textColorText"
        />
        <h3>프리셋</h3>
        <ul>
          <li
            :key="`${backgroundColor}-${i}`"
            v-for="({ backgroundColor, textColor }, i) in presets"
          >
            <button
              :style="{ backgroundColor, color: textColor }"
              @click="bindColors({ backgroundColor, textColor })"
            >
              {{ textColor }} on {{ backgroundColor }}
            </button>
          </li>
        </ul>
        <br />
        <h3>본문사이즈</h3>
        <input
          v-model="paragraphFontSize"
          type="number"
          name="pFontSize"
          id="pFontSize"
        />
      </div>
      <div id="features">
        <!-- 이미지 다운로드 -->
        <input
          v-if="!isLoadingImage"
          type="button"
          value="이미지 다운로드"
          @click="downloadImage"
        />
        <LoadingIcon width="40px" height="40px" v-else alt="불러오는중 " />
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
section {
  display: grid;
  grid-template-columns: 50vw 50vw;
}

.wrapper {
  display: grid;
  place-items: center;
}
article {
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: 350px;
  height: 350px;
  padding: 18px 18px;
  box-sizing: border-box;
  word-break: break-word;

  img {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    object-fit: cover;
    filter: blur(3px);
    z-index: -99;
  }

  p {
    margin-top: 0;
    font-size: 15px;
    line-height: 24px;
  }

  h4 {
    display: inline-block;
    margin: 0px;
  }

  span {
    font-size: 12px;
    margin-left: 8px;
  }
}

input#content {
  width: 200px;
  height: 200px;
}

.config {
  display: grid;
  place-items: center;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}
</style>
