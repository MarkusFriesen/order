import React, {Component} from 'react'
import {Query} from "react-apollo";
import gql from "graphql-tag";

import {Elevation} from '@rmwc/elevation';
import {
  Toolbar,
  ToolbarRow,
  ToolbarSection,
  ToolbarTitle,
  ToolbarIcon
} from '@rmwc/toolbar';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryText,
  ListItemMeta,
  ListDivider
} from '@rmwc/list';
import {LinearProgress} from '@rmwc/linear-progress';
import {Menu, MenuItem, MenuSurfaceAnchor} from '@rmwc/menu';
import FileSaver from "filesaver.js-npm"

export default class History extends Component {
  constructor(props) {
    super(props)
    this.setHistoryFilter = this.setHistoryFilter.bind(this)
    this.getMonday = this.getMonday.bind(this)
  }

  state = {
    menuIsOpen: false,
    minOrderTimestamp: new Date(new Date().toDateString()),
    header: "Todays History"
  }

  getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  downloadData(data, orders) {
    const blob = new Blob(
      ["\uFEFFid,timestamp,name,type,cost\n",
        ...data.map(o => `${o.id},${o.timestamp.toISOString()},${o.name},${o.type},${o.cost}\n`)], {encoding: "UTF-8", type: "text/plain;charset=UTF-8"})
    FileSaver.saveAs(blob, `Dishes sold ${this.state.minOrderTimestamp.toISOString()}-${new Date().toISOString()}.csv`, true)
    const orderBlob = new Blob(
      ["\uFEFFid, timestamp, totalPayed\n",
        ...orders.map(o => `${o._id},${new Date(o.timestamp).toISOString()},${(o.amountPayed || 0).toFixed(2)}\n`)], {encoding: "UTF-8", type: "text/plain;charset=UTF-8"})
    FileSaver.saveAs(orderBlob, `Orders sold ${this.state.minOrderTimestamp.toISOString()} -${new Date().toISOString()}.csv`, true)
  }

  setHistoryFilter(evt) {
    let tmsp = new Date("0");
    let title = "History"

    if (evt.detail.index === 1) {
      tmsp = this.getMonday(new Date(new Date().toDateString()))
      title = "This weeks History"
    } else if (evt.detail.index === 2) {
      tmsp = new Date(new Date().toDateString())
      title = "Todays History"
    }

    this.setState({
      minOrderTimestamp: tmsp,
      header: title
    })
  }

  render() {
    const {id} = this.props.match.params
    return (
      <Elevation className="main-elevation" z={24}>
        <Query
          query={gql`
            {
              orders(hasPayed: true) {
                _id,
                timestamp,
                amountPayed,
                dishes {
                  dish {
                    name,
                    cost,
                    type{
                      name
                    } 
                  }
                }
              }
            }`}>
          {({loading, error, data}) => {
            if (loading) return <LinearProgress />;
            if (error) return <p>Error :(</p>;

            if (id) {
              return this.fetchData(id, data.dishes)
            }

            let ordered = []
            let total = 0
            let totalWithTips = 0
            let ordersInRange = []

            if (data && data.orders)
              ordersInRange = data.orders.filter(o => new Date(o.timestamp) >= this.state.minOrderTimestamp)
              ordersInRange.forEach(o => {
                const timestamp = new Date(o.timestamp)
                o.dishes.forEach(d => {
                    ordered.push({
                      timestamp: timestamp,
                      name: d.dish.name,
                      cost: d.dish.cost.toFixed(2),
                      type: d.dish.type.name,
                      id: o._id
                    })
                  total = total + d.dish.cost
                })
                totalWithTips = totalWithTips + o.amountPayed || 0
              })

            return (
              <React.Fragment>
                <Toolbar>
                  <ToolbarRow>
                    <ToolbarSection alignStart>
                      <ToolbarTitle>{this.state.header}</ToolbarTitle>
                    </ToolbarSection>
                    <ToolbarSection alignEnd>
                      <MenuSurfaceAnchor>
                        <Menu
                          open={this.state.menuIsOpen}
                          onSelect={this.setHistoryFilter}
                          onClose={_ => this.setState({menuIsOpen: false})}
                        >
                          <MenuItem>Everything</MenuItem>
                          <MenuItem>This Week</MenuItem>
                          <MenuItem>Today</MenuItem>
                        </Menu>

                        < ToolbarIcon icon="filter_list"
                          onClick={evt => this.setState({'menuIsOpen': !this.state.menuIsOpen})}
                        />
                      </MenuSurfaceAnchor>
                      <ToolbarIcon icon="cloud_download" onClick={() => this.downloadData(ordered, ordersInRange)} />
                    </ToolbarSection>
                  </ToolbarRow>
                </Toolbar>
                <List>{
                  ordered.map((o, i) =>
                    <ListItem key={i} >
                      <ListItemText>{o.name}
                        <ListItemSecondaryText> {o.timestamp.toDateString()} </ListItemSecondaryText>
                      </ListItemText>
                      <ListItemMeta tag="span" basename="" >{`€ ${o.cost}`}</ListItemMeta>
                    </ListItem>
                  )}

                  <ListDivider />

                  <ListItem>
                    <ListItemText>Total
                      <ListItemSecondaryText>with tip: {`€ ${totalWithTips.toFixed(2)}`} </ListItemSecondaryText>
                    </ListItemText>
                    <ListItemMeta tag="span" basename="" >{`€ ${total.toFixed(2)}`}</ListItemMeta>
                  </ListItem>
                </List>
              </React.Fragment>
            )
          }}
        </Query>
      </Elevation>
    )
  }
}