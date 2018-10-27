<template>
  <div>
    <div id="home-actions" class="ui placeholder segment">
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
          <div class="ui big blue button">
            <i class="fas fa-coins"></i>
            Issue a new token
          </div>
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
  name: "Home"
};
</script>

<style scoped>
#home-actions {
  margin: 24px;
}
</style>
