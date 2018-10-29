<template>
  <div>
    <div id="add-actions" class="ui placeholder segment">
      <div class="ui two column stackable grid">
        <div class="column">
          <div class="ui form">
            <div class="field">
              <label>Token chain ID</label>
              <div class="ui input">
                <input type="text" size="64">
              </div>
            </div>
            <div class="ui blue submit button">Track existing token</div>
          </div>
        </div>
        <div class="middle aligned column">
          <router-link to="/issue">
          <div class="ui big blue button">
            <i class="fas fa-coins"></i>
            Issue a new token
          </div>
          </router-link>
        </div>
      </div>
      <div class="ui vertical divider">
        Or
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddToken"
};
</script>

<style scoped>
#add-actions {
  margin: 24px;
}
</style>
