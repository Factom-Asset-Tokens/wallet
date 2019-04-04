<template>
  <Factoid v-if="canManageFactoids"></Factoid>
  <v-container v-else>
    <v-layout>
      <v-alert value="true" class="title" type="error" outline>
        The configuration of factomd is incorrect. Go to the settings to fix them.
      </v-alert>
    </v-layout>
  </v-container>
</template>

<script>
import Factoid from '@/components/Factoid/Factoid';
import AvailableFeatures from '@/mixins/AvailableFeatures';

export default {
  components: { Factoid },
  mixins: [AvailableFeatures],
  computed: {
    canManageFactoids() {
      return this.availableFeatures('factomd');
    }
  }
};
</script>
