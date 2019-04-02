<!-- Note: This component makes an unorthodox use of v-treeview -->
<template>
  <div>
    <v-treeview :items="identityTreeItems" item-key="id">
      <template slot="prepend" slot-scope="{ item, leaf }">
        <v-icon v-if="!leaf">person</v-icon>
        <span v-else-if="item.type === 'chainid'" class="font-italic subheading">Chain ID:</span>
        <template v-else>
          <v-icon v-if="item.available" color="green" title="Secret key available in the wallet">vpn_key</v-icon>
          <v-icon
            v-else
            color="grey"
            title="Secret key NOT available in the wallet"
            @click.stop="$refs.keyImportDialog.show(item.id)"
            >vpn_key</v-icon
          >
        </template>
      </template>
      <template slot="label" slot-scope="{ item, leaf }">
        <div v-if="!leaf">
          <span class="">{{ item.keyCount }}</span>
          <span class="font-weight-bold secondary--text name-left-margin">{{ item.name }}</span>
        </div>
        <div v-else-if="item.type === 'chainid'" class="font-italic subheading">{{ item.id }}</div>
        <template v-else>
          <div v-if="item.available">{{ item.id }}</div>
          <div
            v-else
            class="grey--text pointer"
            title="Secret key NOT available in the wallet"
            @click.stop="$refs.keyImportDialog.show(item.id)"
          >
            {{ item.id }}
          </div>
        </template>
      </template>
      <template slot="append" slot-scope="{ item, leaf }">
        <v-icon v-if="!leaf" @click.stop="$refs.unlinkIdentityDialog.show(item.id)" title="Unlink identity"
          >link_off</v-icon
        >
      </template>
    </v-treeview>
    <KeyImportDialog ref="keyImportDialog"></KeyImportDialog>
    <UnlinkIdentityConfirmDialog ref="unlinkIdentityDialog"></UnlinkIdentityConfirmDialog>
  </div>
</template>

<script>
import KeyImportDialog from './KeyImportDialog';
import UnlinkIdentityConfirmDialog from './UnlinkIdentityConfirmDialog';
import { mapState } from 'vuex';

export default {
  components: { KeyImportDialog, UnlinkIdentityConfirmDialog },
  data: function() {
    return {};
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
          const keys = that.identities[chainId].keys.map(key => ({
            id: key,
            type: 'key',
            available: that.identityKeysInWallet.has(key)
          }));
          const children = [{ id: chainId, type: 'chainid' }].concat(keys);

          const totalKeys = keys.length;
          const availableKeys = keys.filter(k => k.available).length;
          const keyCount = `(${availableKeys}/${totalKeys})`;
          const name = that.identities[chainId].name.join(' ');
          return {
            id: chainId,
            name,
            keyCount,
            children
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
.name-left-margin {
  margin-left: 10px;
}
</style>
