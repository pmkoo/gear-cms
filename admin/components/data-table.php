<template id="table-template">
	<table class="table">
		<thead>
			<tr>
				<th>
					<div class="checkbox">
						<input id="checkAll" type="checkbox" v-model="checkAll">
						<label for="checkAll"></label>
					</div>
			   	</th>
				<th v-for="key in columns" @click="sortBy(key)" :class="{ active: sortKey == key }">
					<a :class="sortOrders[key] > 0 ? 'asc' : 'dsc'">
						{{ key | lang }}
					</a>
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="entry in data | filterBy filterKey | orderBy sortKey sortOrders[sortKey]">
				<td>
					<div class="checkbox">
						<input id="entry{{ entry.id }}" type="checkbox" v-model="checked" :value="entry.id" number>
						<label for="entry{{ entry.id }}"></label>
					</div>
				</td>
				<td v-for="key in columns">
					{{ entry[key] }}
				</td>
			</tr>
			<tr v-if="!filtered.length">
				<td class="empty" colspan="{{ columnSpan }}">{{ 'no_results' | lang }}</td>
			</tr>
		</tbody>
	</table>
</template>
