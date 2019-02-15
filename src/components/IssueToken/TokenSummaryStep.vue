<template>
  <v-layout v-if="render" row wrap>
    <v-flex xs12>
      <p class="headline">
        Summary of your new token
        <strong class="primary--text">{{tokenId}}</strong>:
      </p>
    </v-flex>
    <v-flex xs12>
      <v-layout wrap my-4>
        <v-flex xs2 my-2>Type:</v-flex>
        <v-flex xs10 my-2>{{type === "fat0" ? "Fungible (FAT-0)" : "Non-fungible (FAT-1)"}}</v-flex>
        <v-flex xs2 my-2>Issuer:</v-flex>
        <v-flex xs10 my-2>{{issuerId}}</v-flex>
        <template v-if="type === 'fat0'">
          <v-flex xs2 my-2>Symbol:</v-flex>
          <v-flex xs10 my-2>{{details.symbol}}</v-flex>
          <v-flex xs2 my-2>Maximum supply:</v-flex>
          <v-flex
            xs10
            my-2
          >{{details.infiniteSupply ? "infinite" : `${details.supply.toLocaleString()} ${details.symbol}`}}</v-flex>
          <v-flex xs2 my-2>Description:</v-flex>
          <v-flex xs10 my-2>{{details.description}}</v-flex>
        </template>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ["render", "details", "tokenId", "issuerId", "type"]
};
</script>