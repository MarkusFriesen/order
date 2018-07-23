import React, { Component } from 'react'
import { TextField } from 'rmwc/TextField';
import { Button } from 'rmwc/Button';
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { LinearProgress } from 'rmwc/LinearProgress';
import { Grid, GridCell } from 'rmwc/Grid';

import {
  List,
  ListItem,
  ListItemText,
  ListItemGraphic,
  ListItemMeta
} from 'rmwc/List';


const PAY = gql`
  mutation pay($id: ID!, $dishes: [orderDishMutation]!){
    updateOrder(_id: $id, dishes: $dishes){
      _id
    }
  }`

export default class PayOrderContent extends Component {
  constructor(){
    super()

    this.changePayment = this.changePayment.bind(this)
    this.toggleSelection = this.toggleSelection.bind(this)
  }
  state = {
    dishes: [],
    paying: 0
  }

  toggleSelection(i){
    return () => {
      const dishes = this.state.dishes
      dishes[i].paying = !dishes[i].paying
      this.setState({ dishes: dishes})
    }
  }
  changePayment(){
    return (e) => {
      if (!isNaN(e.target.value))
        this.setState({ paying: e.target.value})
    }
  }
  componentDidMount(){
    this.setState({
      dishes: this.props.dishesToPay
    })
  }

  render(){
    let total = 0
    return (
      <React.Fragment>
        <List>
          {this.state.dishes.map((v, i) => {
            if (v.paying)
              total = v.dish.cost + total 
          
            return (
            <ListItem key={i} onClick={this.toggleSelection(i)}>
              <ListItemGraphic> {v.paying ? "radio_button_checked" : "radio_button_unchecked"}</ListItemGraphic>
              <ListItemText>{v.dish.name}</ListItemText>
              <ListItemMeta tag="span" basename="">{v.dish.cost.toFixed(2)}</ListItemMeta>
            </ListItem>)
          })}
        
        </List>
        <Grid>
          <GridCell span="12">
            <TextField withLeadingIcon="euro_symbol" disabled label="Total" value={total.toFixed(2)} />
            <TextField withLeadingIcon="euro_symbol" label="Difference" value={(this.state.paying - total).toFixed(2)} onChange={() => {}} invalid={this.state.paying - total < 0} />
            <TextField withLeadingIcon="euro_symbol" label="Paying" type="number" inputMode="numeric" pattern="\d*.*,*\d*" value={this.state.paying} onChange={this.changePayment()}/>
          </GridCell>
        </Grid>
        <Mutation mutation={PAY}>
          {(pay, { data, loading, error }) => {
            let result = <Button onClick={() => {
              pay({
              variables: {
                id: this.props.id,
                dishes: this.state.dishes.map(d => { return { id: d.dish._id, made: d.made, hasPayed: d.paying} })
              }
            })}}>Pay</Button>

            if (loading)
              result =
                <React.Fragment>
                  <LinearProgress determinate={false}></LinearProgress>
                  {result}
                </React.Fragment>
            if (error) console.error(error);

            if (data) this.props.history.goBack()

            return result
          }}
        </Mutation>
    </React.Fragment>)
  }
}