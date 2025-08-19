using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SportZone_API.Controllers;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services.Interfaces;
using Xunit;


namespace SportZone_API.Tests.Controllers
{
    public class DiscountControllerTests
    {
        private readonly Mock<IDiscountService> _discountServiceMock;
        private readonly DiscountController _controller;

        public DiscountControllerTests()
        {
            _discountServiceMock = new Mock<IDiscountService>();
            _controller = new DiscountController(_discountServiceMock.Object);
        }
    }
}
