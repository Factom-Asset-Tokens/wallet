 <template>
  <v-container fluid v-if="areNfTokens">
    <v-layout
      pa-1
      wrap
      v-for="(io, index) in ios"
      :key="io.address"
      align-center
      :class="rowColor(index)"
    >
      <v-flex xs8>{{io.address}}</v-flex>
      <v-flex xs4 text-xs-right>
        <v-chip
          v-for="id in getNfTokens(io.amount)"
          :key="id.min"
          outline
          color="secondary"
          class="font-weight-bold subheading"
        >{{id | displayIds}}</v-chip>
      </v-flex>
    </v-layout>
  </v-container>
  <v-container fluid v-else>
    <v-layout wrap py-1 v-for="io in ios" :key="io.address">
      <v-flex xs8>{{io.address}}</v-flex>
      <v-flex xs4 text-xs-right>{{io.amount}}</v-flex>
    </v-layout>
  </v-container>
</template>


<script>
import {
  displayIds,
  sortIds,
  standardizeId
} from "@/components/Token/fat1/ids-utils.js";

export default {
  props: ["ios"],
  computed: {
    areNfTokens() {
      return Array.isArray(this.ios[0].amount);
    }
  },
  methods: {
    getNfTokens(amount) {
      return sortIds(amount.map(standardizeId));
    },
    rowColor(index) {
      return index % 2 ? "lightGrey" : "";
    }
  },
  filters: {
    displayIds
  }
};
</script>