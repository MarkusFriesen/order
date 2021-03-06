import React from 'react'
import { observer, inject } from "mobx-react"
import {
  List,
  ListItem, 
  ListItemGraphic,
  ListItemText
} from '@rmwc/list';
import {
  Toolbar,
  ToolbarRow,
  ToolbarSection,
  ToolbarTitle
} from '@rmwc/toolbar';

const GlobalSettings = (props) => 
(
  <React.Fragment>
    <Toolbar>
      <ToolbarRow>
        <ToolbarSection alignStart>
          <ToolbarTitle>Global Settings</ToolbarTitle>
        </ToolbarSection>
      </ToolbarRow>
    </Toolbar>
    <List>
      <ListItem onClick={() => props.store.setKitchenMode(!props.store.kitchenMode)}>
        <ListItemGraphic icon={ props.store.kitchenMode ? "radio_button_checked" : "radio_button_unchecked"}/>
        <ListItemText>Kitchen Mode</ListItemText>
      </ListItem>
    </List>
    </React.Fragment>
)

export default inject("store")(observer(GlobalSettings))