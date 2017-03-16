import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import R from 'ramda';
import { Button, Row, Col, Form, Icon, Input, Select, Switch } from 'antd';
import { Link } from 'react-router-dom';
import { sanitize } from '../../utils/inputs';
import { loadCompanies } from '../../actions/companies';
import { loadTags } from '../../actions/tags';
import { addPeople, loadPeople } from '../../actions/people';
import { getVisibleCompanies } from '../../selectors/companies';
import { getTags } from '../../selectors/tags';
import Avatar from '../Avatar';
import fields from '../../forms/people';

const FormItem = Form.Item;
const Option = Select.Option;

const IconDelete = styled(Icon)`
  cursor: pointer;
  margin: 10px 0 0 3px;
`;

const Color = styled.div`
  width: 20px;
  height: 20px;
  border: 1px solid white;
  border-radius: 20px;
  background-color: ${props => props.color};
`;

const roles = ['Admin', 'Edit', 'Access'];

class EditPeople extends Component {
  state = {
    name: '',
    color: '',
    phoneFieldsCount: 0,
    phoneLabel: '',
    phoneNumber: '',
  };

  componentWillMount() {
    const { loadCompanies, loadTags, loadPeople } = this.props;
    loadCompanies();
    loadTags();
    loadPeople();
  }

  redirect = (location = '/people') => {
    const { history } = this.props;
    this.setState(() => history.push(location));
  }

  add = () => {
    const { form: { setFieldsValue, getFieldDecorator, getFieldValue, resetFields } } = this.props;
    const { phoneFieldsCount, phoneLabel, phoneNumber } = this.state;
    this.setState({ phoneFieldsCount: phoneFieldsCount + 1 });
    getFieldDecorator(fields.phones.key, fields.phones);
    const phones = getFieldValue(fields.phones.key);
    const nextPhones = phones.concat({ id: phoneFieldsCount, label: phoneLabel, number: phoneNumber });
    setFieldsValue({
      phones: nextPhones,
    });
    this.setState({ phoneLabel: '', phoneNumber: '' });
    resetFields([fields.phoneNumber.key]);
  }

  remove = (k) => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    const phones = getFieldValue('phones');
    if (!phones.length) return null;
    setFieldsValue({
      phones: phones.filter(phone => phone !== k),
    });
  }

  handleSubmit = (e) => {
    const {
      form: { validateFieldsAndScroll },
      addPeople,
    } = this.props;

    e.preventDefault();

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { color, preferred, firstName, lastName,
          type, jobType, company, tags, note, phones } = sanitize(values, fields);
        const newPeople = {
          avatar: { color },
          preferred,
          firstName,
          lastName,
          type,
          jobType,
          companyId: company,
          tags,
          note,
          phones,
        };
        addPeople(newPeople);
        this.redirect();
      } else {
        console.log('err', err); // eslint-disable-line
      }
    });
  }

  handleReset = () => {
    const { form: { resetFields } } = this.props;
    const { color: { initialValue } } = fields;
    resetFields();
    this.setState({ name: '', color: initialValue });
  }

  handleColorChange = (value) => {
    this.setState({ color: value });
  }

  handlePhoneLabel = (value) => {
    this.setState({ phoneLabel: value });
  }

  handlePhoneNumber = (e) => {
    this.setState({ phoneNumber: e.target.value });
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue, setFieldsValue }, companies, companiesObj, tags, people, match } = this.props;
    const { phoneLabel, phoneNumber } = this.state;
    const currentPerson = (match) ? people[match.params.id] : {};
    const companyName = (currentPerson) ? companiesObj[currentPerson.companyId].name : '';
    getFieldDecorator(fields.phones.key, fields.phones);
    getFieldDecorator(fields.phoneLabel.key, fields.phoneLabel);
    // console.log(fields.color.initialValue);
    // fields.color.initialValue = (currentPerson) ? currentPerson.avatar.color : fields.color.initialValue;
    // console.log(fields.color.initialValue);
    // getFieldDecorator(fields.color.key, fields.color);
    // const color = getFieldValue(fields.color.key);
    // const newColor = (currentPerson) ? color.concat({ initialValue: currentPerson.avatar.color }) : color;
    // setFieldsValue({
    //   color: newColor,
    // });
    const phoneAdd =
    (
      <FormItem>
        <Col>
          <Select onChange={this.handlePhoneLabel} style={{ width: '70px' }} placeholder="Select ..." >
            { R.map(({ key, value }) =>
              <Option value={key} key={key}>
                {value}
              </Option>)(fields.phoneLabel.domainValues)}
          </Select>
          {getFieldDecorator(fields.phoneNumber.key, fields.phoneNumber)(
            <Input
              placeholder="phone number"
              style={{ width: '150px' }}
              onChange={this.handlePhoneNumber}
            />
          )}
        </Col>
      </FormItem>);
    return (
      (currentPerson) ?
        <Form onSubmit={this.handleSubmit}>
          <Row style={{ marginBottom: '32px' }}>
            <Col xs={12}>
              <Row type="flex" gutter={16} justify="start">
                <Col>
                  <Avatar name={currentPerson.name} color={currentPerson.avatar.color} showTooltip />
                </Col>
                <Col>
                  <h2>Edit Person</h2>
                </Col>
              </Row>
            </Col>
            <Col xs={12}>
              <Row type="flex" justify="end" gutter={8}>
                <Col>
                  <Button type="primary" htmlType="submit" size="large">Update</Button>
                </Col>
                <Col>
                  <Button type="danger" size="large"><Link to="/people">Cancel</Link></Button>
                </Col>
                <Col>
                  <Button type="dashed" size="large" onClick={this.handleReset}>Clear</Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" align="middle" style={{ height: '30px' }}>
            <Col>
              <FormItem>
                {getFieldDecorator(fields.color.key, fields.color)(
                  <Select
                    size="small"
                    style={{ width: '60px' }}
                    onChange={this.handleColorChange}
                  >
                    {/* {console.log('color init value: ', fields.color.initialValue, 'my Color:', currentPerson.avatar.color.toString())} */}
                    { R.map(c =>
                      <Option value={c} key={c}>
                        <Color color={c} />
                      </Option>)(fields.color.domainValues) }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem>
                {getFieldDecorator(fields.preferred.key, { ...fields.preffered, initialValue: currentPerson.preffered })(
                  <Switch
                    checkedChildren={<i className="fa fa-star" />}
                    unCheckedChildren={<i className="fa fa-star-o" />}
                  />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={4}>
              <FormItem label={fields.prefix.label}>
                {getFieldDecorator(fields.prefix.key, { ...fields.prefix, initialValue: currentPerson.prefix })(
                  <Select style={{ textTransform: 'capitalize' }}>
                    { R.map(({ key, value }) =>
                      <Option value={key} key={key}>
                        {value}
                      </Option>)(fields.prefix.domainValues) }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={10}>
              <FormItem label={fields.firstName.label}>
                {
                  getFieldDecorator(fields.firstName.key, { ...fields.firstName, initialValue: currentPerson.firstName })(
                    <Input type="text" />)
                }
              </FormItem>
            </Col>
            <Col sm={10}>
              <FormItem label={fields.lastName.label}>
                {
                  getFieldDecorator(fields.lastName.key, { ...fields.lastName, initialValue: currentPerson.lastName })(
                    <Input placeholder="Last Name" type="text" />)
                }
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col sm={4}>
              <FormItem label={fields.type.label}>
                {getFieldDecorator(fields.type.key, { ...fields.type, initialValue: currentPerson.type })(
                  <Select style={{ textTransform: 'capitalize' }}>
                    { R.map(({ key, value }) =>
                      <Option value={key} key={key}>
                        {value}
                      </Option>)(fields.type.domainValues) }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={16}>
              <FormItem label={fields.email.label}>
                {
                  getFieldDecorator(fields.email.key, { ...fields.email, initialValue: currentPerson.email })(
                    <Input type="text" />)
                }
              </FormItem>
            </Col>
            <Col sm={4}>
              <FormItem label={fields.jobType.label}>
                {getFieldDecorator(fields.jobType.key, { ...fields.jobType, initialValue: currentPerson.jobType })(
                  <Select style={{ textTransform: 'capitalize' }}>
                    { R.map(({ key, value }) =>
                      <Option value={key} key={key}>
                        {value}
                      </Option>)(fields.jobType.domainValues) }
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem label={fields.company.label}>
                {getFieldDecorator(fields.company.key, { ...fields.company, initialValue: companyName })(
                  <Select>
                    <Option value="" placeholder="No company">No company</Option>
                    { R.map(company =>
                      <Option key={company._id}>
                        {company.name}
                      </Option>)(companies) }
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <FormItem>
              <Col xs={12} sm={10} md={8}>
                {phoneAdd}
              </Col>
              <Col xs={6} sm={4} md={4}>
                {
                  (phoneLabel && phoneNumber.length >= 10)
                  ?
                    <Button onClick={this.add}>
                      Add phone
                      <Icon type="plus" />
                    </Button>
                  :
                    <Button disabled onClick={this.add}>
                      Add phone
                      <Icon type="plus" />
                    </Button>
                }
              </Col>
            </FormItem>
          </Row>
          <Row gutter={24}>
            {
              R.map(phone =>
                <Col key={phone.number}>
                  <Col span={7}>
                    <FormItem>
                      <Input
                        addonBefore={phone.label}
                        defaultValue={phone.number}
                        disabled
                        style={{ background: 'white', color: 'black' }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={1}>
                    <IconDelete
                      type="minus-circle-o"
                      style={{ color: '#f04134', fontSize: '12px', fontWeight: 'bold' }}
                      onClick={() => this.remove(phone)}
                    />
                  </Col>
                </Col>
              )(currentPerson.phones)
            }
          </Row>
          <Row gutter={24}>
            <Col sm={12}>
              <FormItem label={fields.tags.label}>
                {getFieldDecorator(fields.tags.key, { ...fields.tags, initialValue: currentPerson.tags })(
                  <Select placeholder="Tags" tags>
                    { R.map(tag =>
                      <Option key={tag} value={tag}>
                        {tag}
                      </Option>)(tags) }
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col sm={12}>
              <FormItem label={fields.roles.label}>
                {getFieldDecorator(fields.roles.key, { ...fields.roles, initialValue: currentPerson.roles })(
                  <Select mutiple>
                    { R.map(role =>
                      <Option value={role} key={role}>
                        {role}
                      </Option>)(roles) }
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <FormItem label={fields.jobDescription.label}>
              {
                getFieldDecorator(fields.jobDescription.key, { ...fields.jobDescription, initialValue: currentPerson.jobDescription })(
                  <Input placeholder="Job Description" type="textarea" />)
              }
            </FormItem>
          </Row>
        </Form>
        : null
    );
  }
}

EditPeople.propTypes = {
  form: PropTypes.object.isRequired,
  companies: PropTypes.array.isRequired,
  companiesObj: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  people: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loadCompanies: PropTypes.func.isRequired,
  loadTags: PropTypes.func.isRequired,
  loadPeople: PropTypes.func.isRequired,
  match: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  companies: getVisibleCompanies(state),
  companiesObj: state.companies.data,
  tags: getTags(state),
  people: state.people.data,
});

const actions = { loadCompanies, loadTags, loadPeople, addPeople };
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default R.compose(
  Form.create(),
  connect(mapStateToProps, mapDispatchToProps))(EditPeople);
