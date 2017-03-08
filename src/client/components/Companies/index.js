import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { List } from './List';
import { togglePreferredFilter, togglePreferred, loadCompanies, filterCompanyList } from '../../actions/companies';
import { TitleIcon, Header, HeaderLeft, HeaderRight, Title, Search } from '../widgets/Header';
import Preferred from '../widgets/Preferred';
import { getVisibleCompanies } from '../../selectors/companies';
import { AddButton } from '../Button/';

export class Companies extends Component {

  componentWillMount() {
    const { loadCompanies } = this.props;
    loadCompanies();
  }

  onFilterChange = (e) => {
    const { filterCompanyList } = this.props;
    filterCompanyList(e.target.value);
  }

  handlePreferredFilter = () => {
    const { togglePreferredFilter } = this.props;
    togglePreferredFilter();
  }

  render() {
    const { companies, filter = '', preferredFilter, filterCompanyList, togglePreferred } = this.props;
    return (
      <div>
        <Header>
          <HeaderLeft>
            <TitleIcon name="home" />
            <Title title="Companies" />
          </HeaderLeft>
          <HeaderRight>
            <Search filter={filter} onChange={this.onFilterChange} />
            <Preferred active={preferredFilter} onChange={this.handlePreferredFilter} />
          </HeaderRight>
        </Header>
        <AddButton to="/companies/add" />
        <List companies={companies} filterCompanyList={filterCompanyList} togglePreferred={togglePreferred} />
      </div>
    );
  }
}

Companies.propTypes = {
  companies: PropTypes.array.isRequired,
  filter: PropTypes.string,
  loadCompanies: PropTypes.func.isRequired,
  filterCompanyList: PropTypes.func.isRequired,
  preferredFilter: PropTypes.bool,
  togglePreferred: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  companies: getVisibleCompanies(state),
  filter: state.companies.filter,
  preferredFilter: state.companies.preferredFilter,
});
const actions = { loadCompanies, filterCompanyList, togglePreferred, togglePreferredFilter };
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Companies);
