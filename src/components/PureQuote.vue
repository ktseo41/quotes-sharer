<script setup lang="ts">
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_FONT_SIZE,
} from "@/constants";
import { computed, onMounted, ref, toRefs } from "vue";

const props = defineProps({
  content: {
    type: String,
    required: true,
    default: "",
  },
  textColor: {
    type: String,
    required: false,
    default: DEFAULT_TEXT_COLOR,
  },
  backgroundColor: {
    type: String,
    required: false,
    default: DEFAULT_BACKGROUND_COLOR,
  },
  contentFontSize: {
    type: Number,
    required: false,
    default: DEFAULT_FONT_SIZE,
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
  author: {
    type: String,
    required: false,
    default: "",
  },
});

const emits = defineEmits(["mounted"]);

const isMounted = ref(false);
const contentRef = ref(null);
const { content, title, author, textColor, backgroundColor, contentFontSize } =
  toRefs(props);

const titleWithSymbol = computed(() =>
  title.value.length ? `『${title.value}』` : ""
);
const authorWithSymbol = computed(() =>
  author.value.length ? `- ${author.value}` : ""
);

onMounted(() => {
  isMounted.value = true;
  emits("mounted", true);
});

defineExpose({
  contentRef,
});
</script>
<template>
  <div ref="contentRef" class="shadow-lg content-wrapper">
    <textarea v-model="content" spellcheck="false" disabled></textarea>
    <div class="content-bottom">
      <div class="content-bottom__title-and-author">
        <h4 class="title">{{ titleWithSymbol }}</h4>
        <span class="author">{{ authorWithSymbol }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.content-wrapper {
  width: calc(100vw - 2rem);
  max-width: 25rem;
  height: calc(100vw - 2rem);
  max-height: 25rem;
  padding: 1rem;
  color: v-bind("textColor");
  background-color: v-bind("backgroundColor");
  font-size: v-bind("`${contentFontSize}px`");
  cursor: pointer;

  textarea {
    display: block;
    width: 100%;
    height: calc(100% - 3rem);
    background-color: inherit;
    border-radius: 0;
    color: inherit;
    outline: none;
    resize: none;
    cursor: pointer;
  }

  .content-bottom {
    width: 100%;
    display: table;

    .content-bottom__title-and-author {
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

    .content-bottom__text-count {
      display: table-cell;
      vertical-align: bottom;
      color: #999;
      font-size: 0.7rem;
    }
  }
}
</style>
