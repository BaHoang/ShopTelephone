import { Button, Col, Form, Input, message, Modal, Row, Select } from 'antd';
import addressApi from 'apis/addressApi';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import provinceListJSON from 'assets/dummy/local.json';
const { Option } = Select;

function AddressUpdateForm(props) {
  const { onCloseForm, info, item } = props;
  const { name, phone, address } = info;
  const { province, district, wards, details } = address;
  const [isVisible, setIsVisible] = useState(true);
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [wardList, setWardList] = useState([]);
  const provinceId = useRef('');
  const formRef = useRef(null);
  const user = useSelector((state) => state.user);

  // fn: lấy danh sách tỉnh thành
  useEffect(() => {
    // dùng để cleanup effect
    let isSubscribe = true;

    async function getProvinceList() {
      setProvinceList(provinceListJSON);
      const listDis = provinceListJSON.find(
        (provinceItem) => provinceItem.name === province,
      ).districts;
      setDistrictList(listDis);
      setWardList(
        listDis.find((districtItem) => districtItem.name === district).wards,
      );
    }
    getProvinceList();
    // cleanup
    return () => (isSubscribe = false);
  }, []);

  // fn: lấy danh sách huyện/xã khi đã chọn tỉnh/thành
  const getDistrictList = async (provinceId = 0) => {
    try {
      const response = provinceListJSON.find(
        (province) => province.id === provinceId,
      );
      if (response) {
        setDistrictList(response.districts);
      }
    } catch (error) {
      throw error;
    }
  };

  // fn: lấy danh sách huyện/xã khi đã chọn tỉnh/thành
  const getWardStreetList = async (provinceId = 0, districtId) => {
    try {
      const response = districtList.find(
        (district) => district.id === districtId,
      );
      if (response) {
        setWardList(response.wards);
      }
    } catch (error) {
      throw error;
    }
  };

  // event: update địa chỉ
  const onUpdateAddress = async (newAddress) => {
    try {
      const { name, phone, ...rest } = newAddress;

      const { province, district, wards, details } = rest;
      let sentData = {
        name,
        phone,
        address: {
          province,
          district,
          wards,
          details,
        },
      };

      if (parseInt(province, 10) >= 0) {
        const provinceName = provinceListJSON.find(
          (provinceItem) => provinceItem.id == province,
        ).name;
        sentData.address.province = provinceName;
      }

      if (parseInt(district, 10) >= 0) {
        const districtName = districtList.find(
          (districtItem) => districtItem.id == district,
        ).name;
        sentData.address.district = districtName;
      }

      if (parseInt(wards, 10) >= 0) {
        const wardName = wardList.find((wardItem) => wardItem.id == wards).name;
        sentData.address.wards = wardName;
      }

      const userId = user._id;
      const response = await addressApi.updateDeliveryAddress(
        userId,
        sentData,
        item + 1,
      );
      if (response && response.status === 200) {
        message.success('Cập nhật địa chỉ thành công', 2);
      }
    } catch (error) {
      console.log(error);
      if (error) {
        if (error.response) message.error(error.response.data.message, 2);
        else message.error('Cập nhật địa chỉ thất bại', 2);
      }
    }
    setIsVisible(false);
    onCloseForm(1);
  };

  // rendering ...
  return (
    <Modal
      visible={isVisible}
      closable={true}
      maskClosable={false}
      onCancel={() => {
        setIsVisible(false);
        onCloseForm();
      }}
      centered
      width={768}
      footer={[
        <Button
          key="back"
          danger
          onClick={() => {
            setIsVisible(false);
            onCloseForm();
          }}>
          Huỷ bỏ
        </Button>,
        <Button key="submit" type="primary" htmlType="submit" form="form">
          Cập nhật địa chỉ
        </Button>,
      ]}>
      <Form
        onFinish={onUpdateAddress}
        ref={formRef}
        name="form"
        initialValues={{
          name,
          phone,
          province,
          district,
          wards,
          details,
        }}>
        <Row gutter={[32, 0]}>
          <Col span={12}>
            <h3>Thông tin người nhận hàng</h3>
            <Form.Item
              name="name"
              className="m-tb-16"
              rules={[
                { required: true, message: '* Bắt buộc nhập' },
                {
                  max: 40,
                  message: 'Tối đa 40 ký tự',
                },
              ]}>
              <Input size="middle" placeholder="Họ tên *" maxLength={60} />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '* Bắt buộc nhập' },
                {
                  validator: (_, value) =>
                    /0\d{0,9}/gi.test(value)
                      ? Promise.resolve()
                      : Promise.reject('Số điện thoại không hợp lệ'),
                },
                {
                  max: 10,
                  message: 'Số điện thoại bao gồm 10 số',
                },
                {
                  min: 10,
                  message: 'Số điện thoại bao gồm 10 số',
                },
              ]}>
              <Input
                size="middle"
                placeholder="Số điện thoại *"
                maxLength={12}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <h3>Địa chỉ giao hàng</h3>
            {/* tỉnh thành */}
            <Form.Item
              name="province"
              rules={[{ required: true, message: '* bắt buộc nhập' }]}>
              <Select
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                showSearch
                onChange={(value) => {
                  getDistrictList(value);
                  provinceId.current = value;
                  formRef.current.resetFields(['district', 'wards', 'street']);
                  formRef.current.setFieldsValue({
                    district: '',
                    wards: '',
                    details: '',
                  });
                }}
                placeholder="Tỉnh/thành"
                className="m-tb-16"
                size="middle">
                {provinceList.map((item, index) => (
                  <Option value={item.id} key={index}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* huyễn/ quận */}
            <Form.Item
              name="district"
              rules={[{ required: true, message: '* bắt buộc nhập' }]}>
              <Select
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                showSearch
                onChange={(value) => {
                  getWardStreetList(provinceId.current, value);
                  formRef.current.setFieldsValue({
                    wards: '',
                    details: '',
                  });
                }}
                placeholder="Huyện/Quận"
                size="middle">
                {districtList.map((item, index) => (
                  <Option value={item.id} key={index}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* phường, xã */}
            <Form.Item
              name="wards"
              rules={[{ required: true, message: '* bắt buộc nhập' }]}>
              <Select
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="m-tb-16"
                showSearch
                placeholder="Phường/Xã"
                onChange={(value) => {
                  formRef.current.setFieldsValue({
                    details: '',
                  });
                }}
                size="middle">
                {wardList.map((item, index) => (
                  <Option value={item.id} key={index}>
                    {item.prefix + ' ' + item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* chi tiết */}
            <Form.Item
              name="details"
              rules={[{ required: true, message: '* bắt buộc nhập' }]}>
              <Input
                className="m-t-16"
                maxLength={100}
                placeholder="Số nhà cụ thể"
                size="middle"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

AddressUpdateForm.propTypes = {
  info: PropTypes.object,
  onCloseForm: PropTypes.func,
  item: PropTypes.number,
};

export default AddressUpdateForm;
