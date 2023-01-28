<script setup lang="ts">
import { ref, computed, toRefs } from "vue";

const props = defineProps({
  textColor: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    required: true,
  },
  contentFontSize: {
    type: Number,
    required: true,
  },
  showTextCount: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

const { title, author, textColor, backgroundColor, contentFontSize } =
  toRefs(props);

const contentRef = ref();
const content = ref();

const titleWithSymbol = computed(() =>
  title.value.length ? `『${title.value}』` : ""
);
const authorWithSymbol = computed(() =>
  author.value.length ? `- ${author.value}` : ""
);

defineExpose({
  contentRef,
});
</script>
<template>
  <div ref="contentRef" class="shadow-lg content-wrapper">
    <textarea v-model="content" spellcheck="false"></textarea>
    <div class="content-bottom">
      <div class="content-bottom__title-and-author">
        <h4 class="title">{{ titleWithSymbol }}</h4>
        <span class="author">{{ authorWithSymbol }}</span>
      </div>
      <div v-if="showTextCount" class="content-bottom__text-count">
        {{ content?.length }}
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
