<template>
  <v-radio-group v-model="type" @change="$emit('input', type)">
    <div slot="label">
      Which
      <strong>type</strong> of token do you wish to issue?
    </div>
    <v-radio value="fat0">
      <div slot="label">
        Fungible (FAT-0)
        <v-icon>help_outline</v-icon>
      </div>
    </v-radio>
    <v-radio value="fat1">
      <div slot="label">
        <div slot="label">
          Non-fungible (FAT-1)
          <v-icon>help_outline</v-icon>
        </div>
      </div>
    </v-radio>
  </v-radio-group>
</template>

<script>
export default {
  props: ['value'],
  data: function() {
    return {
      type: this.value
    };
  }
};
</script>
