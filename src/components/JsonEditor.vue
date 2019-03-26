<template>
  <div id="jsoneditor" height="600px"></div>
</template>

<script>
import JSONEditor from 'jsoneditor';

export default {
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    value: {
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      jsoneditor: null
    };
  },
  methods: {
    getText() {
      return this.jsoneditor.getText();
    },
    get() {
      return this.jsoneditor.get();
    },
    getOptions() {
      return Object.assign(
        {
          onChange: this.onChange,
          onError: this.onError
        },
        this.options
      );
    },
    onChange() {
      try {
        const value = this.jsoneditor.get();
        this.$emit('input', value);
        // eslint-disable-next-line
      } catch (e) {
      } finally {
        this.$emit('onChange');
      }
    },
    onError(error) {
      this.$emit('error', error);
    }
  },
  mounted() {
    this.jsoneditor = new JSONEditor(document.getElementById('jsoneditor'), this.getOptions(), this.value);

    this.onChange();
  },
  beforeDestroy() {
    this.jsoneditor.destroy();
    this.jsoneditor = null;
  }
};
</script>

<style scoped>
@import '../../node_modules/jsoneditor/dist/jsoneditor.min.css';
@import '../assets/css/jsoneditor-theme.css';
</style>
