<template>
  <v-dialog v-model="display" max-width="600px" @keydown.esc="display = false">
    <v-card>
      <v-form v-model="valid" @submit.prevent="add" ref="form">
        <v-card-title class="primary">
          <span class="headline">Select ID range between {{min}} and {{max}}</span>
        </v-card-title>
        <v-card-text>
          <v-layout wrap>
            <v-flex xs6 text-xs-center pa-3 class="subheading">From ID</v-flex>
            <v-flex xs6 text-xs-center pa-3 class="subheading">To ID</v-flex>
            <v-flex xs6 px-3>
              <v-text-field
                background-color="lightGrey"
                full-width
                v-model.number="from"
                type="number"
                label="From"
                :min="min"
                :max="to"
                :rules="fromRules"
                required
                solo
              ></v-text-field>
            </v-flex>
            <v-flex xs6 px-3>
              <v-text-field
                background-color="lightGrey"
                full-width
                :rules="toRules"
                v-model.number="to"
                type="number"
                label="To"
                :min="from"
                :max="max"
                required
                solo
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat outline @click="display = false">Close</v-btn>
          <v-btn color="primary" type="submit" :disabled="!valid">Add</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function() {
    return {
      display: false,
      valid: true,
      min: 0,
      max: 0,
      from: 0,
      to: 0,
      fromRules: [
        v =>
          (Number.isInteger(v) && v >= this.min && v <= this.max) ||
          `ID must be an integer between ${this.min} and ${this.max}`,
        v => v <= this.to || `ID must be lower than range upper bound.`
      ],
      toRules: [
        v =>
          (Number.isInteger(v) && v >= this.min && v <= this.max) ||
          `ID must be an integer between ${this.min} and ${this.max}`,
        v => v >= this.from || `ID must be higher than range lower bound.`
      ]
    };
  },
  methods: {
    show(min, max) {
      this.min = min;
      this.max = max;
      this.from = min;
      this.to = max;
      this.display = true;
    },
    add() {
      if (this.$refs.form.validate()) {
        this.$emit("add", { min: this.from, max: this.to });
        this.display = false;
        this.$refs.form.reset();
      }
    }
  }
};
</script>


<style scoped>
</style>
