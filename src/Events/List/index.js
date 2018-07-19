import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import * as _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';

import { fetchConferences } from './duck';
import { fetchWishListIfNeeded } from '../WishList/duck';
import Loading from '../../common/Loading';
import { orderEventsByMonthChronologicaly } from '../../service';
import Card from '../../common/Card';
import Event from '../Event';

class CardList extends Component {
    static propTypes = {
        events: PropTypes.shape({
            numberOfEvents: PropTypes.number,
            eventsFetched: PropTypes.number,
            isFetching: PropTypes.bool,
            lastFetched: PropTypes.number,
            data: PropTypes.arrayOf(PropTypes.instanceOf(Event)),
            error: PropTypes.number,
        }).isRequired,
        auth: PropTypes.shape({
            isAuthenticated: PropTypes.bool,
            token: PropTypes.string,
        }).isRequired,
        wishList: PropTypes.shape({
            data: PropTypes.arrayOf(PropTypes.instanceOf(Event)),
            isFetching: PropTypes.bool,
            lastFetched: PropTypes.number,
        }),
        fetchConferences: PropTypes.func.isRequired,
        fetchWishListIfNeeded: PropTypes.func.isRequired,
    };

    static defaultProps = {
        wishList: {},
    }

    constructor(props) {
        super(props);

        this.state = {
            eventsGroupedByMonth: {},
        };
        this.eventsGroupedByMonth = {};
        //this.eventsGroupedByMonth = orderEventsByMonthChronologicaly(this.eventsGroupedByMonth);
        this.wishListIds = [];
    }

    componentDidMount() {
        const successCb = () => {
            this.props.events.data.forEach((event) => {
                const month = moment(event.start).format('MMMM|YYYY');

                this.eventsGroupedByMonth[month] = {
                    month: moment(event.start).format('MMMM'),
                    data: this.eventsGroupedByMonth[month] ?
                        [...this.eventsGroupedByMonth[month].data, event] : [event],
                };
                this.setState({
                    eventsGroupedByMonth: this.eventsGroupedByMonth,
                });
            });

            if (this.props.auth.isAuthenticated) {
                this.props.fetchWishListIfNeeded(this.props.auth.token);
            }
        };

        this.props.fetchConferences(0, 2, successCb);
    }


    fetchMoreData = () => {
        console.log('fetchdata')
        const eventIds = [];
        const successCb = () => {

            const events = [];
            _.forEach(this.state.eventsGroupedByMonth, (group, key) => {
                group.data.map((ev) => {
                    eventIds.push(ev.id);
                });
            });

            this.props.events.data.map(ev => {
                eventIds.includes(ev.id) ? null : events.push(ev);
            });


            events.forEach((event) => {
                const month = moment(event.start).format('MMMM|YYYY');

                this.eventsGroupedByMonth[month] = {
                    month: moment(event.start).format('MMMM'),
                    data: this.eventsGroupedByMonth[month] ?
                        [...this.eventsGroupedByMonth[month].data, event] : [event],
                };


                this.setState({
                    eventsGroupedByMonth: this.eventsGroupedByMonth,
                });
            });

            if (this.props.auth.isAuthenticated) {
                this.props.fetchWishListIfNeeded(this.props.auth.token);
            }
        };


        const fetchEventsStart = this.props.events.eventsFetched;
        const fetchEventsEnd = this.props.events.eventsFetched + 2;

        this.props.fetchConferences(fetchEventsStart, fetchEventsEnd, successCb);
    }

    /**
     * Get the cards, ordered by month and build the JSX ordering (by month again.)
     */
    renderCards = () => {
        if (_.isEmpty(this.state.eventsGroupedByMonth)) {
            return null;
        }

        const cards = [];

        if (this.props.wishList.data !== undefined) {
            this.props.wishList.data.map(ev => this.wishListIds.push(ev.id));
        }

        _.forEach(this.state.eventsGroupedByMonth, (group, key) => {
            cards.push(
                <div key={key} className="mb-5">
                    <h2 className="cards-date font-weight-normal">
                        { group.month }
                    </h2>
                    {
                        group.data.map((event) => {
                            return _.indexOf(this.wishListIds, event.id) !== -1 ?
                                <Card key={event.id} event={event} wishListed /> :
                                <Card key={event.id} event={event} />;
                        })
                    }
                </div>);
        });

        return cards;
    }

    render() {
        const { error } = this.props.events;
        const { isFetching } = this.props.events;

        if (error !== null) {
            return <Loading />;
        }


        if ((isFetching || isFetching === null) && this.props.events.data === null) {
            return <Loading />;
        }

        if (this.props.auth.isAuthenticated) {
            if (this.props.wishList.isFetching || this.props.wishList.isFetching === null) {
                return <Loading />;
            }
        }

        return (
            <div className="container mx-auto pt-5 pb-5">
                <InfiniteScroll
                    dataLength={this.props.events.eventsFetched} //This is important field to render the next data
                    next={this.fetchMoreData}
                    hasMore={this.props.events.numberOfEvents > this.props.events.eventsFetched}
                    loader={<Loading />}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                            <b>Yay! You have seen it all</b>
                        </p>
                    }
                >
                    { this.renderCards() }
                </InfiniteScroll>
            </div>
        );
    }
}

const mapStateToProps = ({ events, auth, wishList }) => ({
    events,
    auth,
    wishList,
});

const mapDispatchToProps = {
    fetchConferences,
    fetchWishListIfNeeded,
};

export default connect(mapStateToProps, mapDispatchToProps)(CardList);
