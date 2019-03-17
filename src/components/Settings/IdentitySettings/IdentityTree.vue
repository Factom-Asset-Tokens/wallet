<template>
  <div>
    <v-treeview :items="identityTreeItems" item-key="name">
      <template slot="prepend" slot-scope="{ item, leaf }">
        <v-icon v-if="!leaf">person</v-icon>
        <v-icon
          v-else-if="leaf && item.available"
          color="green"
          title="Secret key available in the wallet"
        >vpn_key</v-icon>
        <v-icon
          v-else
          color="grey"
          title="Secret key NOT available in the wallet"
          @click.stop="$refs.keyImportDialog.show(item.name)"
        >vpn_key</v-icon>
      </template>
      <template slot="label" slot-scope="{ item, leaf }">
        <div v-if="!leaf">({{item.availableKeys}}/{{item.totalKeys}}) {{item.name}}</div>
        <div v-else-if="leaf && item.available">{{item.name}}</div>
        <div
          v-else
          class="grey--text pointer"
          title="Secret key NOT available in the wallet"
          @click.stop="$refs.keyImportDialog.show(item.name)"
        >{{item.name}}</div>
      </template>
      <template slot="append" slot-scope="{ item, leaf }">
        <v-icon v-if="!leaf" @click.stop="$refs.unlinkIdentityDialog.show(item.name)" title="Unlink identity">link_off</v-icon>
      </template>
    </v-treeview>
    <KeyImportDialog ref="keyImportDialog"></KeyImportDialog>
    <UnlinkIdentityConfirmDialog ref="unlinkIdentityDialog"></UnlinkIdentityConfirmDialog>
  </div>
</template>

<script>
import KeyImportDialog from "./KeyImportDialog";
import UnlinkIdentityConfirmDialog from "./UnlinkIdentityConfirmDialog";
import { mapState } from "vuex";

export default {
  components: { KeyImportDialog, UnlinkIdentityConfirmDialog },
  data: function() {
    return {};
  },
  mounted() {
    this.$store.dispatch("identity/init");
  },
  computed: {
    ...mapState({
      identities: state => state.identity.identities,
      identityKeysInWallet: state => state.identity.identityKeysInWallet
    }),
    identityTreeItems() {
      const that = this;
      return Object.keys(this.identities)
        .sort()
        .map(function(chainId) {
          const keys = that.identities[chainId].map(key => ({
            name: key,
            available: that.identityKeysInWallet.has(key)
          }));

          const totalKeys = keys.length;
          const availableKeys = keys.filter(k => k.available).length;
          return {
            name: `${chainId}`,
            totalKeys,
            availableKeys,
            children: keys
          };
        });
    }
  }
};
</script>


<style scoped>
.pointer {
  cursor: pointer;
}
</style>
