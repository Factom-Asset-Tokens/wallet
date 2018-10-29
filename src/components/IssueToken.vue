<template>
  <div>
      <h1>Issue a new Token</h1>

      <div class="ui form">
        <div class="inline fields">
          <label>What type of token do you want to create?</label>
          <div class="field">
            <div class="ui radio checkbox">
              <input id="fat-0" type="radio" value="FAT-0" v-model="fatType">
              <label for="fat-0">Fungible (FAT-0)</label>
            </div>
          </div>
          <div class="field">
            <div class="ui radio checkbox">
              <input id="fat-1" type="radio" value="FAT-1" v-model="fatType">
              <label for="fat-1">Non fungible (FAT-1)</label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="fatType">
        <h3>Create a {{fatType}} token</h3>
        <div v-if="fatType === 'FAT-0'">
          FAT-0 form...
        </div>
        <div v-else-if="fatType === 'FAT-1'">
          FAT-1 form...
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: "IssueToken",
  data: function() {
    return {
      fatType: ""
    };
  }
};
</script>

<style scoped>
</style>
